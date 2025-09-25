import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { LlmGatewayService } from './llm-gateway.service';

const FALLBACK_PROMPT = 'Сформируй памятку по процедуре развода';

describe('LlmGatewayService smoke', () => {
  it('возвращает демо-ответ, если не задан LLM_GATEWAY_URL', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LlmGatewayService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined)
          }
        }
      ]
    }).compile();

    const service = moduleRef.get(LlmGatewayService);

    const result = await service.relayPrompt({
      prompt: FALLBACK_PROMPT,
      locale: 'ru'
    });

    expect(result.reply).toContain('демо-ответ');
    expect(result.metadata).toMatchObject({
      locale: 'ru',
      promptTokens: 0,
      completionTokens: 0
    });
  });
});
