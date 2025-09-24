import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { caseIdParamSchema } from '@aidvokat/contracts';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('cases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @Roles('user', 'admin_registered', 'admin_full')
  findAll(@Req() request: RequestWithUser) {
    return this.casesService.findAllByUser(request.user.id);
  }

  @Get(':id')
  @Roles('user', 'admin_registered', 'admin_full')
  async findOne(@Param() params: { id: string }, @Req() request: RequestWithUser) {
    const parsed = caseIdParamSchema.safeParse(params);
    if (!parsed.success) {
      throw new BadRequestException('Некорректный идентификатор дела');
    }
    const item = await this.casesService.findOne(parsed.data.id);
    if (!item || item.userId !== request.user.id) {
      throw new BadRequestException('Дело не найдено или недоступно');
    }
    return item;
  }

  @Post()
  @Roles('user', 'admin_registered', 'admin_full')
  create(@Req() request: RequestWithUser, @Body() dto: CreateCaseDto) {
    return this.casesService.create(request.user.id, dto);
  }
}
