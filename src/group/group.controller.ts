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

  // user-role part
  @Post('/:groupname/member/:uuid/role/:id')
  async addUserRole(
    @Param('groupname') group_uuid: string,
    @Param('uuid') user_uuid: string,
    @Param('id') role_id: number,
  ) {
    return this.groupService.addUserRole({ user_uuid, group_uuid, role_id });
  }

  @Get('/:groupname/member/:uuid/role')
  async getUserRoles(
    @Param('groupname') group_uuid: string,
    @Param('uuid') user_uuid: string,
  ) {
    return this.groupService.getUserRoles(user_uuid, group_uuid);
  }

  @Get('/:groupname/role/:id')
  async getUsersByRole(
    @Param('groupname') group_uuid: string,
    @Param('id') role_id: number,
  ) {
    return this.groupService.getUsersByRole(group_uuid, role_id);
  }

  @Delete('/group/:groupname/delete')
  async deleteGroupRoles(
    @Param('groupname') groupUuid: string,
  ) {
    return this.groupService.deleteGroupRoles(groupUuid);
  }

  @Delete('/member/:uuid/delete')
  async deleteUserRoles(
    @Param('uuid') userUuid: string,
  ) {
    return this.groupService.deleteUserRoles(userUuid);
  }

}
