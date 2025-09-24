import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { caseIdParamSchema } from '@aidvokat/contracts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@Controller('cases/:caseId/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @Roles('user', 'admin_registered', 'admin_full')
  async findByCase(@Req() request: RequestWithUser, @Param('caseId') caseId: string) {
    const parsed = caseIdParamSchema.safeParse({ id: caseId });
    if (!parsed.success) {
      throw new BadRequestException('Некорректный идентификатор дела');
    }
    return this.messagesService.findByCase(parsed.data.id, request.user.id);
  }

  @Post()
  @Roles('user', 'admin_registered', 'admin_full')
  create(
    @Req() request: RequestWithUser,
    @Param('caseId') caseId: string,
    @Body() dto: CreateMessageDto
  ) {
    const parsed = caseIdParamSchema.safeParse({ id: caseId });
    if (!parsed.success) {
      throw new BadRequestException('Некорректный идентификатор дела');
    }

    return this.messagesService.createForCase(request.user.id, parsed.data.id, dto);
  }
}
