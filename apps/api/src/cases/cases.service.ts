import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { caseCreateSchema } from '@aidvokat/contracts';

@Injectable()
export class CasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCaseDto) {
    const parsed = caseCreateSchema.parse({ ...dto });
    return this.prisma.case.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        category: parsed.category,
        language: parsed.language,
        metadata: parsed.metadata,
        userId
      }
    });
  }

  findAllByUser(userId: string) {
    return this.prisma.case.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.case.findUnique({ where: { id } });
  }
}
