import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { RolesGuard } from '../common/guards/roles.guard';
import { LlmGatewayModule } from '../llm-gateway/llm-gateway.module';

@Module({
  imports: [LlmGatewayModule],
  providers: [MessagesService, RolesGuard],
  controllers: [MessagesController]
})
export class MessagesModule {}
