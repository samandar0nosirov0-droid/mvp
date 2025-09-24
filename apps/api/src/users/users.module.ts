import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  providers: [UsersService, RolesGuard],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
