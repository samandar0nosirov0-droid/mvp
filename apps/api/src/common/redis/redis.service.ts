import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.client = new Redis(url, {
      lazyConnect: true
    });
  }

  async storeRefreshTokenHash(sessionId: string, hash: string, ttlSeconds: number) {
    await this.client.set(this.refreshKey(sessionId), hash, 'EX', ttlSeconds);
  }

  getRefreshTokenHash(sessionId: string) {
    return this.client.get(this.refreshKey(sessionId));
  }

  async deleteRefreshTokenHash(sessionId: string) {
    await this.client.del(this.refreshKey(sessionId));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  private refreshKey(sessionId: string) {
    return `session:${sessionId}:refresh-hash`;
  }
}
