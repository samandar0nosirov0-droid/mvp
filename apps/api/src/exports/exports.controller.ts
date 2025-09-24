import { Controller, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('exports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post('cases/:id/pdf')
  @Roles('user', 'admin_registered', 'admin_full')
  exportCasePdf(
    @Req() request: RequestWithUser,
    @Param('id', new ParseUUIDPipe()) caseId: string
  ) {
    return this.exportsService.exportCaseToPdf(request.user.id, caseId);
  }
}
