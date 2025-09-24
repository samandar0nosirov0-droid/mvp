import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const [users, cases, feedbacks, activeSessions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.case.count(),
      this.prisma.feedback.count(),
      this.prisma.session.count({ where: { expiresAt: { gt: new Date() } } })
    ]);

    return {
      users,
      cases,
      feedbacks,
      activeSessions
    };
  }
}
