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
import { UserGuard } from 'src/user/guard/user.guard';
import { GetRoleListResDto } from './dto/res/getRoleRes.dto';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/req/createRole.dto';
import { GetUser } from 'src/user/decorator/getUser.decorator';
import { User } from '@prisma/client';

@ApiTags('Role')
@ApiOAuth2(['email', 'profile', 'openid'], 'oauth2')
@Controller('group/:groupName/role')
@UseGuards(UserGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Get roles', description: 'Get roles for a group' })
  @ApiOkResponse({ type: GetRoleListResDto })
  @Get()
  async getRoles(
    @Param('groupName') groupName: string,
    @GetUser() user: User,
  ): Promise<GetRoleListResDto> {
    return this.roleService.getRoles(groupName, user.uuid);
  }

  @ApiOperation({
    summary: 'Create role',
    description: 'Create a role for a group',
  })
  @ApiCreatedResponse({ description: 'Role created' })
  @ApiConflictResponse({ description: 'Role already exists' })
  @ApiInternalServerErrorResponse({
    description: 'Database error or server unknown error',
  })
  @Post()
  async createRole(
    @Param('groupName') groupName: string,
    @Body() createRoleDto: CreateRoleDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.roleService.createRole(groupName, createRoleDto, user.uuid);
  }

  @ApiOperation({
    summary: 'Update role',
    description:
      'Update a role, it is not appending the authorities, but replacing it',
  })
  @ApiOkResponse({ description: 'Role updated' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiInternalServerErrorResponse({
    description: 'Database error or server unknown error',
  })
  @Put(':id')
  async updateRole(
    @Param('groupName') groupName: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: CreateRoleDto,
    @GetUser() user: User,
  ): Promise<void> {
    return this.roleService.updateRole(groupName, id, updateRoleDto, user.uuid);
  }

  @ApiOperation({ summary: 'Delete role', description: 'Delete a role' })
  @ApiOkResponse({ description: 'Role deleted' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiInternalServerErrorResponse({
    description: 'Database error or server unknown error',
  })
  @Delete(':id')
  async deleteRole(
    @Param('groupName') groupName: string,
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.roleService.deleteRole(groupName, id, user.uuid);
  }
}
