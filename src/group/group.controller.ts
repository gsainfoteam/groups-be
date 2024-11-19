import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GroupService } from './group.service';
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOAuth2,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { User } from '@prisma/client';
import { GroupsGuard } from 'src/auth/guard/groups.guard';
import {
  GroupListResDto,
  GroupResDto,
  MemberListResDto,
  MemberResDto,
} from './dto/res/groupRes.dto';
import { InviteCodeResDto } from './dto/res/inviteCodeRes.dto';
import { ExpandedGroupResDto } from './dto/res/ExpandedGroupRes.dto';
import { JoinDto } from './dto/req/join.dto';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserVisibilityInGroupDto } from './dto/req/updateUserVisibilityInGroup.dto';
import { ChangePresidentDto } from './dto/req/changePresident.dto';
import { CheckGroupExistenceByNameDto } from './dto/res/checkGroupExistenceByName.dto';
import { GroupCreateResDto } from './dto/res/groupCreateRes.dto';
import { InvitationInfoResDto } from './dto/res/invitationInfoRes.dto';
import { InvitationExpDto } from './dto/req/invitationExp.dto';
import { GetGroupByNameQueryDto } from './dto/req/getGroup.dto';

@ApiTags('group')
@ApiOAuth2(['openid', 'email', 'profile'])
@Controller('group')
@UseGuards(GroupsGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiOperation({
    summary: 'Get all groups',
    description: '자신이 속한 모든 그룹을 가져오는 API 입니다.',
  })
  @ApiOkResponse({ type: GroupListResDto })
  @ApiInternalServerErrorResponse()
  @Get()
  async getGroupList(@GetUser() user: User): Promise<GroupListResDto> {
    return {
      list: (await this.groupService.getGroupList(user.uuid)).map((group) => {
        return new GroupResDto(group);
      }),
    };
  }

  @ApiOperation({
    summary: 'Get the invited group name and email of invited group president',
    description: '초대 그룹 이름과 그룹 관리자의 email을 조회합니다.',
  })
  @ApiOkResponse({ type: InvitationInfoResDto })
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Get('join')
  async getInvitationInfo(
    @Query('code') code: string,
    @GetUser() user: User,
  ): Promise<InvitationInfoResDto> {
    return new InvitationInfoResDto(
      await this.groupService.getInvitationInfo(code, user.uuid),
    );
  }

  @ApiOperation({
    summary: 'Get Groups by name(partial)',
    description:
      '그룹명의 일부를 입력받고, 입력받은 문자열이 포함된 그룹명을 가지는 그룹을 가져오는 API입니다.',
  })
  @ApiOkResponse({ type: GroupListResDto })
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Get('search')
  async getGroupListByGroupNameQuery(
    @Query() groupNameQuery: GetGroupByNameQueryDto,
  ): Promise<GroupListResDto> {
    return {
      list: (
        await this.groupService.getGroupListByGroupNameQuery(groupNameQuery)
      ).map((group) => {
        return new GroupResDto(group);
      }),
    };
  }

  @ApiOperation({
    summary: 'Get a group by uuid',
    description: 'uuid를 바탕으로 특정 그룹을 가져오는 API 입니다.',
  })
  @ApiOkResponse({ type: ExpandedGroupResDto })
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Get(':uuid')
  async getGroupByUuid(
    @Param('uuid') uuid: string,
    @GetUser() user: User,
  ): Promise<ExpandedGroupResDto> {
    return new ExpandedGroupResDto(
      await this.groupService.getGroupByUuid(uuid, user.uuid),
    );
  }

  @ApiOperation({
    summary: 'Check group existence by name',
    description: '이름을 바탕으로 특정 그룹이 존재하는지 확인하는 API입니다.',
  })
  @ApiOkResponse({ type: CheckGroupExistenceByNameDto })
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Get(':name/exist')
  async checkGroupExistenceByName(
    @Param('name') name: string,
  ): Promise<CheckGroupExistenceByNameDto> {
    return this.groupService.checkGroupExistenceByName(name);
  }

  @ApiOperation({
    summary: 'Create a group',
    description:
      '그룹을 만드는 API 입니다. 이를 통해 만들어지 그룹의 장과, 그룹의 모든 권한은 그룹을 만든 사람에게 부여됩니다.',
  })
  @ApiCreatedResponse()
  @ApiConflictResponse()
  @ApiInternalServerErrorResponse()
  @Post()
  async createGroup(
    @Body() body: CreateGroupDto,
    @GetUser() user: User,
  ): Promise<GroupCreateResDto> {
    return this.groupService.createGroup(body, user.uuid);
  }

  @ApiOperation({
    summary: 'Update group info',
    description: '그룹의 정보를 업데이트하는 API입니다.',
  })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Patch(':uuid')
  async updateGroup(
    @Param('uuid') uuid: string,
    @Body() body: UpdateGroupDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.groupService.updateGroup(body, uuid, user.uuid);
  }

  @ApiOperation({
    summary: 'Upload a group image',
    description:
      '그룹의 이미지를 업로드하는 API 입니다. 이미 존재하는 이미지는 덮어씌워집니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @UseInterceptors(FileInterceptor('file'))
  @Post(':uuid/image')
  async uploadGroupImage(
    @Param('uuid') uuid: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ): Promise<void> {
    return this.groupService.uploadGroupImage(file, uuid, user.uuid);
  }

  @ApiOperation({
    summary: 'Delete a group',
    description:
      '그룹을 삭제하는 API 입니다. 삭제시 그룹의 모든 정보가 삭제됩니다.',
  })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Delete(':uuid')
  async deleteGroup(
    @Param('uuid') uuid: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.groupService.deleteGroup(uuid, user.uuid);
  }

  @ApiOperation({
    summary: 'Create an invite code',
    description:
      '그룹에 초대 코드를 만드는 API 입니다. 초대 코드를 통해 그룹에 가입할 수 있습니다. 코드가 유효한 duration의 최소값은 1, 최대값은 60 * 60 * 24 * 30 = 2592000입니다.',
  })
  @ApiCreatedResponse({ type: InviteCodeResDto })
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Post(':uuid/invite')
  async createInviteCode(
    @Param('uuid') uuid: string,
    @Query() query: InvitationExpDto,
    @GetUser() user: User,
  ): Promise<InviteCodeResDto> {
    return this.groupService.createInviteCode(uuid, user.uuid, query.duration);
  }

  @ApiOperation({
    summary: 'Join a group',
    description: '그룹에 가입하는 API 입니다.',
  })
  @ApiCreatedResponse({
    description: '그룹에 성공적으로 가입되었습니다.',
  })
  @ApiForbiddenResponse({
    description:
      '옳지 않은 초대 코드입니다. 초대 코드가 만료되었거나, 존재하지 않습니다.',
  })
  @ApiInternalServerErrorResponse()
  @Post('join')
  async joinGroup(@Body() body: JoinDto, @GetUser() user: User): Promise<void> {
    return this.groupService.joinMember(body.code, user.uuid);
  }

  @ApiOperation({
    summary: 'Get Group members information',
    description:
      '멤버 읽기 권한이 있는 그룹장 및 그룹원들이 그룹인원들의 정보를 가져옵니다.만약 그룹 멤버가 아니라면, public 그룹원들만 볼 수 있습니다. ',
  })
  @ApiOkResponse({ type: MemberListResDto })
  @ApiInternalServerErrorResponse()
  @Get(':uuid/member')
  async getMemberInGroup(
    @Param('uuid') uuid: string,
    @GetUser() user: User,
  ): Promise<MemberListResDto> {
    return {
      list: (await this.groupService.getMembersByGroupUuid(uuid, user)).map(
        (member) => new MemberResDto(member),
      ),
    };
  }

  @ApiOperation({
    summary: 'delete a member',
    description: '그룹에 멤버를 추방하는 API 입니다.',
  })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Delete(':uuid/member/:targetUuid')
  async removeMember(
    @Param('uuid') uuid: string,
    @Param('targetUuid') targetUuid: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.groupService.removeMember(uuid, targetUuid, user.uuid);
  }

  @ApiOperation({
    summary: 'grant a role',
    description: '그룹의 멤버의 역할을 추가하는 API 입니다.',
  })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Patch(':uuid/member/:targetUuid/role')
  async grantRoleToUser(
    @Param('uuid') uuid: string,
    @Param('targetUuid') targetUuid: string,
    @Query('roleId', ParseIntPipe) roleId: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.groupService.grantRole(uuid, targetUuid, roleId, user.uuid);
  }

  @ApiOperation({
    summary: 'Delete a role',
    description: '그룹의 멤버의 역할을 삭제하는 API 입니다.',
  })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Delete(':uuid/member/:targetUuid/role')
  async revokeRoleFromUser(
    @Param('uuid') uuid: string,
    @Param('targetUuid') targetUuid: string,
    @Query('roleId', ParseIntPipe) roleId: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.groupService.revokeRole(uuid, targetUuid, roleId, user.uuid);
  }

  @ApiOperation({
    summary: 'Update "visibility" of user in group',
    description: '그룹 소속 여부의 공개/비공개 전환을 위한 API입니다.',
  })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Patch(':uuid/visibility')
  async updateUserVisibilityInGroup(
    @Param('uuid') groupUuid: string,
    @Body() body: UpdateUserVisibilityInGroupDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.groupService.updateUserVisibilityInGroup(
      user.uuid,
      groupUuid,
      body.visibility,
    );
  }

  @ApiOperation({
    summary: 'Change president of the group',
    description: '그룹의 President를 변경하는 API입니다.',
  })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Patch(':uuid/president')
  async changePresident(
    @Param('uuid') groupUuid: string,
    @Body() body: ChangePresidentDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.groupService.changePresident(
      user.uuid,
      body.newPresidentUuid,
      groupUuid,
    );
  }
}
