import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { caseMessageCreateSchema, messageRoleSchema } from '@aidvokat/contracts';
import { LlmGatewayService } from '../llm-gateway/llm-gateway.service';

// Разрешённые роли для контекста LLM
type ChatRole = 'user' | 'assistant' | 'system';

// Элементы истории, которые нам нужны для контекста
type HistoryEntry = {
  role: string;     // Хранимое в БД значение (может быть шире)
  content: string;
};

// Роль ассистента по контракту (fallback на 'assistant')
const assistantRole = (messageRoleSchema as any)?.enum?.assistant ?? 'assistant';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llmGatewayService: LlmGatewayService
  ) {}

  private async ensureCaseOwnership(caseId: string, userId: string) {
    const existingCase = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!existingCase || existingCase.userId !== userId) {
      throw new BadRequestException('Дело не найдено или недоступно');
    }
    return existingCase;
  }

  async createForCase(userId: string, caseId: string, dto: CreateMessageDto) {
    const parsed = caseMessageCreateSchema.parse({ ...dto, caseId });
    await this.ensureCaseOwnership(parsed.caseId, userId);

    // История сообщений по делу (для контекста LLM)
    const history = await this.prisma.message.findMany({
      where: { caseId: parsed.caseId },
      orderBy: { createdAt: 'asc' }
    });

    // Сохраняем пользовательское сообщение
    const userMessage = await this.prisma.message.create({
      data: {
        caseId: parsed.caseId,
        userId,
        role: parsed.role,
        content: parsed.content,
        locale: parsed.locale
      }
    });

    // Явная типизация параметра entry устраняет TS7006 (implicit any)
    const context = history.map(({ role, content }: HistoryEntry) => ({
      role: (role as ChatRole) ?? 'user',
      content
    }));

    // Запрос к LLM с историей
    const llmResponse = await this.llmGatewayService.relayPrompt({
      prompt: parsed.content,
      locale: parsed.locale,
      context
    });

    // Сообщение ассистента
    const assistantMessage = await this.prisma.message.create({
      data: {
        caseId: parsed.caseId,
        role: assistantRole,
        content: llmResponse.reply,
        locale: llmResponse.metadata.locale ?? parsed.locale,
        traceId: llmResponse.metadata.traceId,
        promptTokens: llmResponse.metadata.promptTokens,
        completionTokens: llmResponse.metadata.completionTokens
      }
    });

    return { userMessage, assistantMessage };
  }

  async findByCase(caseId: string, userId: string) {
    await this.ensureCaseOwnership(caseId, userId);
    return this.prisma.message.findMany({
      where: { caseId },
      orderBy: { createdAt: 'asc' }
    });
  }
}
