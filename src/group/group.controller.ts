import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { UserGuard } from 'src/user/guard/user.guard';
import { GetGroupListRequestDto } from './dto/req/getGroupListRequest.dto';
import { GetUser } from 'src/user/decorator/getUser.decorator';
import { User } from '@prisma/client';
import { GetGroupRequestDto } from './dto/req/getGroupRequest.dto';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
import { DeleteGroupDto } from './dto/req/deleteGroup.dto';

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

  @Get(':name')
  async getGroup(@Param('name') name: GetGroupRequestDto) {
    return this.groupService.getGroup(name);
  }

  @Post()
  async createGroup(@Body() body: CreateGroupDto) {
    return this.groupService.createGroup(body);
  }

  @Patch(':name')
  async updateGroup(@Param('name') name: string, @Body() body: UpdateGroupDto) {
    return this.groupService.updateGroup(name, body);
  }

  @Delete(':name')
  async deleteGroup(@Param('name') name: DeleteGroupDto) {
    return this.groupService.deleteGroup(name);
  }
}
