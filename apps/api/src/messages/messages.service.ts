import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { caseMessageCreateSchema, messageRoleSchema } from '@aidvokat/contracts';
import { LlmGatewayService } from '../llm-gateway/llm-gateway.service';

type ChatRole = 'user' | 'assistant' | 'system';
type HistoryEntry = { role: string; content: string };

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

    const history = await this.prisma.message.findMany({
      where: { caseId: parsed.caseId },
      orderBy: { createdAt: 'asc' }
    });

    const userMessage = await this.prisma.message.create({
      data: {
        caseId: parsed.caseId,
        userId,
        role: parsed.role,
        content: parsed.content,
        locale: parsed.locale
      }
    });

    const context = history.map(({ role, content }: HistoryEntry) => ({
      role: (role as ChatRole) ?? 'user',
      content
    }));

    const llmResponse = await this.llmGatewayService.relayPrompt({
      prompt: parsed.content,
      locale: parsed.locale,
      context
    });
    
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
