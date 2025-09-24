import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { SESSION_CLEANUP_QUEUE } from '../auth.constants';

interface SessionCleanupPayload {
  sessionId: string;
}

@Processor(SESSION_CLEANUP_QUEUE)
export class SessionCleanupProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService, private readonly redisService: RedisService) {
    super();
  }

  async process(job: { data: SessionCleanupPayload }) {
    const { sessionId } = job.data;
    await Promise.all([
      this.prisma.session.deleteMany({ where: { id: sessionId } }),
      this.redisService.deleteRefreshTokenHash(sessionId)
    ]);
  }
}
