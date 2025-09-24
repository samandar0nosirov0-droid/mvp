import { Module } from '@nestjs/common';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [ExportsController],
  providers: [ExportsService, RolesGuard]
})
export class ExportsModule {}
