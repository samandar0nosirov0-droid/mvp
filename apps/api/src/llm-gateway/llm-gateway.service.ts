import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { llmGatewayResponseSchema, llmPromptSchema } from '@aidvokat/contracts';
import { RelayPromptDto } from './dto/relay-prompt.dto';

@Injectable()
export class LlmGatewayService {
  private readonly logger = new Logger(LlmGatewayService.name);

  constructor(private readonly configService: ConfigService) {}

  async relayPrompt(dto: RelayPromptDto) {
    const parsed = llmPromptSchema.parse({ ...dto });
    const providerUrl = this.configService.get<string>('LLM_GATEWAY_URL');

    if (!providerUrl) {
      this.logger.warn('LLM_GATEWAY_URL не задан, возвращаем заглушку');
      return {
        reply:
          '⚖️ Айдвокат пока использует демо-ответ. Настройте LLM_GATEWAY_URL для подключения к внешнему провайдеру.',
        metadata: {
          locale: parsed.locale,
          promptTokens: 0,
          completionTokens: 0
        }
      };
    }

    try {
      this.logger.log(`Запрос к LLM по адресу ${providerUrl}`);
      const response = await fetch(providerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsed)
      });

      const traceIdFromHeader = response.headers.get('x-trace-id') ?? undefined;

      if (!response.ok) {
        this.logger.error(`LLM Gateway вернул статус ${response.status}`);
        throw new Error(`LLM Gateway responded with status ${response.status}`);
      }

      const raw = await response.json();
      const parsedResponse = llmGatewayResponseSchema.parse(raw);

      return {
        reply: parsedResponse.reply,
        metadata: {
          locale: parsedResponse.metadata.locale ?? parsed.locale,
          traceId: parsedResponse.metadata.traceId ?? traceIdFromHeader,
          promptTokens: parsedResponse.metadata.promptTokens,
          completionTokens: parsedResponse.metadata.completionTokens
        }
      };
    } catch (error) {
      this.logger.error('Ошибка при запросе к LLM Gateway', error instanceof Error ? error.stack : String(error));
      return {
        reply:
          '⚖️ Сейчас не удаётся получить ответ от LLM. Попробуйте повторить запрос позже или обратитесь в поддержку.',
        metadata: {
          locale: parsed.locale,
          promptTokens: 0,
          completionTokens: 0
        }
      };
    }
  }
}
