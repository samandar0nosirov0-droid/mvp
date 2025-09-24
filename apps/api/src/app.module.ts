import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CasesModule } from './cases/cases.module';
import { MessagesModule } from './messages/messages.module';
import { PrismaModule } from './prisma/prisma.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ExportsModule } from './exports/exports.module';
import { AdminModule } from './admin/admin.module';
import { LlmGatewayModule } from './llm-gateway/llm-gateway.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL ?? 'redis://localhost:6379'
      }
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    CasesModule,
    MessagesModule,
    FeedbackModule,
    ExportsModule,
    AdminModule,
    LlmGatewayModule
  ]
})
export class AppModule {}
