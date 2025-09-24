import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { feedbackCreateSchema } from '@aidvokat/contracts';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string | null, dto: CreateFeedbackDto) {
    const parsed = feedbackCreateSchema.parse({ ...dto });
    const metadata = parsed.metadata
      ? Object.fromEntries(
          Object.entries(parsed.metadata).filter(([, value]) => value.trim().length > 0)
        )
      : undefined;

    return this.prisma.feedback.create({
      data: {
        message: parsed.message,
        rating: parsed.rating,
        locale: parsed.locale,
        metadata,
        caseId: parsed.caseId,
        userId
      }
    });
  }

  findAll() {
    return this.prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
