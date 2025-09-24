import { BadRequestException } from '@nestjs/common';
import type { LlmGatewayService } from '../llm-gateway/llm-gateway.service';
import type { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  const prisma = {
    case: {
      findUnique: jest.fn()
    },
    message: {
      findMany: jest.fn(),
      create: jest.fn()
    }
  };

  const llmGateway = {
    relayPrompt: jest.fn()
  };

  let service: MessagesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MessagesService(
      prisma as unknown as PrismaService,
      llmGateway as unknown as LlmGatewayService
    );
  });

  it('creates assistant reply with tokens from LLM gateway', async () => {
    const caseId = '00000000-0000-0000-0000-000000000001';
    const userId = 'user-1';

    prisma.case.findUnique.mockResolvedValue({ id: caseId, userId });
    prisma.message.findMany.mockResolvedValue([
      {
        id: 'm-1',
        caseId,
        role: 'assistant',
        content: 'Здравствуйте!',
        locale: 'ru'
      }
    ]);
    const userMessage = {
      id: 'm-2',
      caseId,
      userId,
      role: 'user',
      content: 'Подскажите порядок расторжения брака',
      locale: 'ru'
    };
    const assistantMessage = {
      id: 'm-3',
      caseId,
      role: 'assistant',
      content: 'Опишите ситуацию подробнее',
      locale: 'ru',
      traceId: 'trace-1',
      promptTokens: 100,
      completionTokens: 200
    };

    prisma.message.create
      .mockResolvedValueOnce(userMessage)
      .mockResolvedValueOnce(assistantMessage);

    llmGateway.relayPrompt.mockResolvedValue({
      reply: assistantMessage.content,
      metadata: {
        locale: assistantMessage.locale,
        traceId: assistantMessage.traceId,
        promptTokens: assistantMessage.promptTokens,
        completionTokens: assistantMessage.completionTokens
      }
    });

    const result = await service.createForCase(userId, caseId, {
      content: userMessage.content
    });

    expect(llmGateway.relayPrompt).toHaveBeenCalledWith({
      prompt: userMessage.content,
      locale: userMessage.locale,
      context: [
        {
          role: 'assistant',
          content: 'Здравствуйте!'
        }
      ]
    });
    expect(prisma.message.create).toHaveBeenCalledTimes(2);
    expect(prisma.message.create).toHaveBeenLastCalledWith({
      data: expect.objectContaining({
        traceId: assistantMessage.traceId,
        promptTokens: assistantMessage.promptTokens,
        completionTokens: assistantMessage.completionTokens
      })
    });
    expect(result).toEqual({ userMessage, assistantMessage });
  });

  it('throws when case does not belong to user', async () => {
    prisma.case.findUnique.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      userId: 'other-user'
    });

    await expect(
      service.createForCase('user-1', '00000000-0000-0000-0000-000000000002', {
        content: 'Сообщение'
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
