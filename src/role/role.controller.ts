import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserGuard } from 'src/user/guard/user.guard';
import { GetRoleListResDto } from './dto/res/getRoleRes.dto';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/req/createRole.dto';

@ApiTags('Role')
@ApiBearerAuth('access-token')
@Controller('group/:groupUuid/role')
@UseGuards(UserGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: 'Get roles', description: 'Get roles for a group' })
  @ApiOkResponse({ type: GetRoleListResDto })
  @Get()
  async getRoles(
    @Param('groupUuid', ParseUUIDPipe) groupUuid: string,
  ): Promise<GetRoleListResDto> {
    return this.roleService.getRoles(groupUuid);
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
    @Param('groupUuid', ParseUUIDPipe) groupUuid: string,
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<void> {
    return this.roleService.createRole(groupUuid, createRoleDto);
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
    @Param('groupUuid', ParseUUIDPipe) groupUuid: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: CreateRoleDto,
  ): Promise<void> {
    return this.roleService.updateRole(groupUuid, id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete role', description: 'Delete a role' })
  @ApiOkResponse({ description: 'Role deleted' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiInternalServerErrorResponse({
    description: 'Database error or server unknown error',
  })
  @Delete(':id')
  async deleteRole(
    @Param('groupUuid', ParseUUIDPipe) groupUuid: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.roleService.deleteRole(groupUuid, id);
  }
}
