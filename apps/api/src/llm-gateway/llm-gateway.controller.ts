import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LlmGatewayService } from './llm-gateway.service';
import { RelayPromptDto } from './dto/relay-prompt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('llm-gateway')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LlmGatewayController {
  constructor(private readonly llmGatewayService: LlmGatewayService) {}

  @Post('prompt')
  @Roles('user', 'admin_registered', 'admin_full')
  relayPrompt(@Body() dto: RelayPromptDto) {
    return this.llmGatewayService.relayPrompt(dto);
  }
}
