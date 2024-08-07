import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GroupService } from './group.service';
import {
  ApiConflictResponse,
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
import { GroupListResDto, GroupResDto } from './dto/res/groupRes.dto';

@ApiTags('group')
@ApiOAuth2(['openid', 'email', 'profile'])
@Controller('group')
@UseGuards(GroupsGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiOperation({
    summary: 'Get all groups',
    description: '자신이 속한 모든 그룹을 가져오는 API 입니다.',
  })
  @ApiOkResponse({ type: [GroupListResDto] })
  @ApiInternalServerErrorResponse()
  @Get()
  async getGroupList(@GetUser() user: User): Promise<GroupListResDto> {
    return this.groupService.getGroupList(user.uuid);
  }

  @ApiOperation({
    summary: 'Get a group',
    description: '특정 그룹을 가져오는 API 입니다.',
  })
  @ApiOkResponse({ type: GroupResDto })
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  @Get(':uuid')
  async getGroup(
    @Param('uuid') uuid: string,
    @GetUser() user: User,
  ): Promise<GroupResDto> {
    return this.groupService.getGroup(uuid, user.uuid);
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
  ): Promise<void> {
    return this.groupService.createGroup(body, user.uuid);
  }

  @ApiOperation({
    summary: 'Delete a group',
    description:
      '그룹을 삭제하는 API 입니다. 삭제시 그룹의 모든 정보가 삭제됩니다.',
  })
  @Delete(':uuid')
  async deleteGroup(): Promise<void> {}
}
