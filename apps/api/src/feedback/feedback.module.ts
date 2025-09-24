import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService, RolesGuard]
})
export class FeedbackModule {}
