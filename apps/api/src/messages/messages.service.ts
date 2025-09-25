import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { caseMessageCreateSchema, messageRoleSchema, MessageRole } from '@aidvokat/contracts';
import { LlmGatewayService } from '../llm-gateway/llm-gateway.service';

type MinimalMsg = { role: string; content: string };

// Разрешённые роли для контекста LLM
type ChatRole = 'user' | 'assistant' | 'system';

// Роль ассистента по контракту (fallback на 'assistant')
const assistantRole: MessageRole = (
  (messageRoleSchema.options as readonly MessageRole[]).find((role) => role === 'assistant') ??
  'assistant'
);

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

    // Используем локальный минимальный тип, чтобы не зависеть от генерации Prisma-типа в тестах
    const context = history.map((entry: MinimalMsg) => ({
      role: (entry.role as ChatRole) ?? 'user',
      content: entry.content
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
