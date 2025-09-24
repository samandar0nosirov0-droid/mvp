import { Module } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  providers: [CasesService, RolesGuard],
  controllers: [CasesController]
})
export class CasesModule {}
