import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { caseIdParamSchema } from '@aidvokat/contracts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':caseId')
  @Roles('user', 'admin')
  async findByCase(@Param() params: { caseId: string }) {
    const parsed = caseIdParamSchema.safeParse({ id: params.caseId });
    if (!parsed.success) {
      throw new BadRequestException('Некорректный идентификатор дела');
    }
    return this.messagesService.findByCase(parsed.data.id);
  }

  @Post()
  @Roles('user', 'admin')
  create(@Req() request: RequestWithUser, @Body() dto: CreateMessageDto) {
    return this.messagesService.create(request.user.id, dto);
  }
}
