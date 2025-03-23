import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOAuth2,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/req/createRole.dto';
import { User } from '@prisma/client';
import { UpdateRoleDto } from './dto/req/updateRole.dto';
import { GroupsGuard } from 'src/auth/guard/groups.guard';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { RoleListResDto } from './dto/res/roleRes.dto';

@ApiTags('Role')
@ApiOAuth2(['email', 'profile', 'openid'], 'oauth2')
@Controller('group/:groupUuid/role')
@UseGuards(GroupsGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({
    summary: 'Get roles',
    description: '그룹 내의 모든 Role을 가져옵니다. 그룹 멤버만 접근 가능합니다.',
  })
  @ApiOkResponse({ type: RoleListResDto })
  @ApiInternalServerErrorResponse({})
  @Get()
  async getRoles(
    @Param('groupUuid') groupUuid: string,
    @GetUser() user: User,
  ): Promise<RoleListResDto> {
    return this.roleService.getRoles(groupUuid, user.uuid);
  }

  @ApiOperation({
    summary: 'Create role',
    description: '그룹 내의 Role을 생성합니다. 필요 권한: ROLE_CREATE',
  })
  @ApiCreatedResponse({ description: 'Role created' })
  @ApiConflictResponse({ description: 'Role already exists' })
  @ApiInternalServerErrorResponse({
    description: 'Database error or server unknown error',
  })
  @Post()
  async createRole(
    @Param('groupUuid') groupUuid: string,
    @Body() createRoleDto: CreateRoleDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.roleService.createRole(groupUuid, createRoleDto, user.uuid);
  }

  @ApiOperation({
    summary: 'Update role',
    description:
      '그룹 내의 Role을 수정합니다. authorities를 수정할 경우, authorities를 전부 다시 넣어주어야 합니다. 필요 권한: ROLE_UPDATE',
  })
  @ApiOkResponse({ description: 'Role updated' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiInternalServerErrorResponse({
    description: 'Database error or server unknown error',
  })
  @Put(':id')
  async updateRole(
    @Param('groupUuid') groupUuid: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.roleService.updateRole(groupUuid, id, updateRoleDto, user.uuid);
  }

  @ApiOperation({
    summary: 'Delete role',
    description: '그룹 내 역할을 삭제합니다. 필요 권한: ROLE_DELETE',
  })
  @ApiOkResponse({ description: 'Role deleted' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiInternalServerErrorResponse({
    description: 'Database error or server unknown error',
  })
  @Delete(':id')
  async deleteRole(
    @Param('groupUuid') groupUuid: string,
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.roleService.deleteRole(groupUuid, id, user.uuid);
  }
}
