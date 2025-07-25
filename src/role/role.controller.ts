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
import { Permission, User } from '@prisma/client';
import { UpdateRoleDto } from './dto/req/updateRole.dto';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { RoleListResDto } from './dto/res/roleRes.dto';
import { Permissions } from './decorator/permission.decorator';
import { PermissionGuard } from './guard/permission.guard';
import { UserGuard } from 'src/auth/guard/user.guard';

@ApiTags('Role')
@ApiOAuth2(['email', 'profile', 'openid'], 'oauth2')
@Controller('group/:groupUuid/role')
@UseGuards(UserGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({
    summary: 'Get roles',
    description:
      '그룹 내의 모든 Role을 가져옵니다. 그룹 멤버만 접근 가능합니다.',
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
  @UseGuards(PermissionGuard)
  @Permissions(Permission.ROLE_CREATE)
  async createRole(
    @Param('groupUuid') groupUuid: string,
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<void> {
    return this.roleService.createRole(groupUuid, createRoleDto);
  }

  @ApiOperation({
    summary: 'Update role',
    description:
      '그룹 내의 Role을 수정합니다. permissions를 수정할 경우, permissions를 전부 다시 넣어주어야 합니다. 필요 권한: ROLE_UPDATE',
  })
  @ApiOkResponse({ description: 'Role updated' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiInternalServerErrorResponse({
    description: 'Database error or server unknown error',
  })
  @Put(':id')
  @UseGuards(PermissionGuard)
  @Permissions(Permission.ROLE_UPDATE)
  async updateRole(
    @Param('groupUuid') groupUuid: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<void> {
    return this.roleService.updateRole(groupUuid, id, updateRoleDto);
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
  @UseGuards(PermissionGuard)
  @Permissions(Permission.ROLE_DELETE)
  async deleteRole(
    @Param('groupUuid') groupUuid: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.roleService.deleteRole(groupUuid, id);
  }
}
