import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { messageCreateSchema } from '@aidvokat/contracts';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateMessageDto) {
    const parsed = messageCreateSchema.parse(dto);
    return this.prisma.message.create({
      data: {
        ...parsed,
        userId
      }
    });
  }

  findByCase(caseId: string) {
    return this.prisma.message.findMany({
      where: { caseId },
      orderBy: { createdAt: 'asc' }
    });
  }
}
