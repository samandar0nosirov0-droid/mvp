import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SESSION_CLEANUP_QUEUE } from './auth.constants';
import { SessionCleanupProcessor } from './processors/session-cleanup.processor';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    BullModule.registerQueue({
      name: SESSION_CLEANUP_QUEUE
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m')
        }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, SessionCleanupProcessor],
  exports: [AuthService]
})
export class AuthModule {}
