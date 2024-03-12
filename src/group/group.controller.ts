import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { UserGuard } from 'src/user/guard/user.guard';
import { GetGroupListRequestDto } from './dto/req/getGroupListRequest.dto';
import { GetUser } from 'src/user/decorator/getUser.decorator';
import { User } from '@prisma/client';

@ApiTags('group')
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @UseGuards(UserGuard)
  async getGroupList(
    @Query() getGroupListRequestDto: GetGroupListRequestDto,
    @GetUser() user?: User,
  ) {
    return this.groupService.getGroupList(getGroupListRequestDto, user?.uuid);
  }
}
