import { Module } from '@nestjs/common';
import { LlmGatewayController } from './llm-gateway.controller';
import { LlmGatewayService } from './llm-gateway.service';
import { ConfigModule } from '@nestjs/config';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [ConfigModule],
  controllers: [LlmGatewayController],
  providers: [LlmGatewayService, RolesGuard]
})
export class LlmGatewayModule {}
