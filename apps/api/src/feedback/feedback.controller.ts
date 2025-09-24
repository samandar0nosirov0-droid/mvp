import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async create(
    @Req() request: Request & Partial<RequestWithUser>,
    @Body() dto: CreateFeedbackDto
  ) {
    const userId = request.user?.id ?? null;
    return this.feedbackService.create(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_registered', 'admin_full')
  findAll() {
    return this.feedbackService.findAll();
  }
}
