import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { llmPromptSchema } from '@aidvokat/contracts';
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
          tokensUsed: 0
        }
      };
    }

    // TODO: реализовать реальный вызов внешнего LLM через fetch
    this.logger.log(`Запрос к LLM по адресу ${providerUrl}`);

    return {
      reply: 'Ответ от LLM пока недоступен в этой среде.',
      metadata: {
        locale: parsed.locale,
        tokensUsed: 0
      }
    };
  }
}
