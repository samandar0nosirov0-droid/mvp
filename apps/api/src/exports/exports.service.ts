import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportsService {
  constructor(private readonly prisma: PrismaService) {}

  async exportCaseToPdf(userId: string, caseId: string) {
    const caseRecord = await this.prisma.case.findFirst({
      where: { id: caseId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!caseRecord) {
      throw new NotFoundException('Дело не найдено или недоступно');
    }

    const pdfPlaceholder = Buffer.from(
      `Айдвокат — экспорт дела\nЗаголовок: ${caseRecord.title}\nСообщений: ${caseRecord.messages.length}`,
      'utf-8'
    );

    return {
      fileName: `case-${caseRecord.id}.pdf`,
      base64: pdfPlaceholder.toString('base64')
      // TODO: заменить заглушку на реальную генерацию PDF
    };
  }
}
