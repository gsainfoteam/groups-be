import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { UserGuard } from 'src/user/guard/user.guard';
import { GetGroupListRequestDto } from './dto/req/getGroupListRequest.dto';
import { GetUser } from 'src/user/decorator/getUser.decorator';
import { User } from '@prisma/client';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
import { AddGroupMemberDto } from './dto/req/addGroupMemeber.dto';

@ApiTags('group')
@Controller('group')
@UsePipes(new ValidationPipe({ transform: true }))
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // 테스트 완료
  @Get()
  @UseGuards(UserGuard)
  async getGroupList(
    @Query() getGroupListRequestDto: GetGroupListRequestDto,
    @GetUser() user?: User,
  ) {
    return this.groupService.getGroupList(getGroupListRequestDto, user?.uuid);
  }

  // 테스트 완료
  @Get(':name')
  async getGroup(@Param('name') name: string) {
    return this.groupService.getGroup(name);
  }

  // 테스트 완료
  @Post()
  async createGroup(@Body() body: CreateGroupDto) {
    return this.groupService.createGroup(body);
  }

  // 테스트 완료
  @Patch(':name')
  async updateGroup(@Param('name') name: string, @Body() body: UpdateGroupDto) {
    return this.groupService.updateGroup(name, body);
  }

  // 테스트 완료
  @Delete(':name')
  async deleteGroup(@Param('name') name: string) {
    return this.groupService.deleteGroup(name);
  }

  // 테스트 완료
  @Get(':name/member')
  async getGroupMember(@Param('name') name: string) {
    return this.groupService.getGroupMember(name);
  }

  // 테스트 완료
  @Post(':name/member')
  async addGroupMember(
    @Param('name') groupName: string,
    @Body() body: AddGroupMemberDto,
  ) {
    return this.groupService.addGroupMember(groupName, body);
  }

  // 테스트 완료
  @Delete(':name/member/:uuid')
  async deleteGroupMemeber(
    @Param('name') groupName: string,
    @Param('uuid', new ParseUUIDPipe()) userUuid: string,
  ) {
    return this.groupService.deleteGroupMember(groupName, userUuid);
  }
}
