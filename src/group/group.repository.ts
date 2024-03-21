import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetGroupListRequestDto } from './dto/req/getGroupListRequest.dto';
import { GetGroupRequestDto } from './dto/req/getGroupRequest.dto';
import { Group } from '@prisma/client';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
import { DeleteGroupDto } from './dto/req/deleteGroup.dto';
import { CreateUserRoleDto } from './dto/req/createUserRole.dto';

@Injectable()
export class GroupRepository {
  private readonly logger = new Logger(GroupRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async getGroupList(
    { type }: GetGroupListRequestDto,
    userUuid?: string,
  ): Promise<Group[]> {
    if (type === 'included') {
      return this.prismaService.group
        .findMany({
          where: {
            users: {
              some: {
                userUuid: userUuid,
              },
            },
          },
        })
        .catch((err) => {
          this.logger.error('getGroupList');
          this.logger.debug(err);
          throw new InternalServerErrorException('database error');
        });
    } else {
      return this.prismaService.group.findMany().catch((err) => {
        this.logger.error('getGroupList');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
    }
  }

  async getGroup({ name }: GetGroupRequestDto): Promise<Group> {
    return this.prismaService.group
      .findUniqueOrThrow({
        where: {
          name: name,
        },
      })
      .catch((err) => {
        this.logger.error('getGroup');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async createGroup({ name, description }: CreateGroupDto) {
    return this.prismaService.group
      .create({
        data: { name, description },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            throw new ConflictException(
              `group with name "${name}" already exists`,
            );
          }
        }
        this.logger.error('createGroup');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async updateGroup(name: string, { description }: UpdateGroupDto) {
    return this.prismaService.group
      .update({
        where: { name: name },
        data: { name: name, description: description },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            throw new ConflictException(
              `group with name "${name}" already exists`,
            );
          }
        }
        this.logger.error('updateGroup');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async deleteGroup({ name }: DeleteGroupDto) {
    return this.prismaService.group
      .delete({
        where: { name: name },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2025') {
            throw new ForbiddenException();
          }
        }
        this.logger.error('deleteNotice');
        this.logger.debug(err);
        throw new InternalServerErrorException('Database error');
      });
  }

  // user-role part
  async addUserRole({ user_uuid, group_uuid, role_id }: CreateUserRoleDto): Promise<void> {
    const exists = await this.groupExists(group_uuid);
    if (!exists) {
      throw new NotFoundException(`Group with UUID ${group_uuid} does not exist.`);
    }
    try {
      await this.prismaService.userRole.create({
        data: {
          userUuid: user_uuid,
          groupUuid: group_uuid,
          roleId: role_id,
        },
      });
      this.logger.log(`UserRole [${user_uuid}, ${group_uuid}, ${role_id}] created`);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.error(`UserRole already exists`);
        }
      } else {
        this.logger.error('Failed to create UserRole', error);
        throw error;
      }
    }
  }

  async getUserRoles(user_uuid: string, group_uuid: string): Promise<number[]> {
    const roles = await this.prismaService.userRole.findMany({
      where: {
        userUuid: user_uuid,
        groupUuid: group_uuid,
      },
      select: {
        roleId: true,
      },
    });

    if (!roles.length) {
      throw new NotFoundException(`No roles found for user ${user_uuid} in group ${group_uuid}`);
    }

    return roles.map(role => role.roleId);
  }

  async getUsersByRole(group_uuid: string, role_id: number): Promise<string[]> {
    const users = await this.prismaService.userRole.findMany({
      where: {
        groupUuid: group_uuid,
        roleId: role_id,
      },
      select: {
        userUuid: true,
      },
    });

    if (!users.length) {
      throw new NotFoundException(`No users found with role ${role_id} in group ${group_uuid}`);
    }

    return users.map(user => user.userUuid);
  }

  async deleteGroupRoles(groupUuid: string): Promise<void> {
    const exists = await this.groupExists(groupUuid);
    if (!exists) {
      throw new NotFoundException(`Group with UUID ${groupUuid} does not exist.`);
    }

    await this.prismaService.userRole.deleteMany({
      where: {
        groupUuid: groupUuid,
      },
    });
  }
  
  async deleteUserRoles(userUuid: string): Promise<void> {
    await this.prismaService.userRole.deleteMany({
      where: {
        userUuid: userUuid,
      },
    });
  }

  async deleteGroupMemberRoles(groupUuid: string, userUuid: string): Promise<void> {
    const exists = await this.groupExists(groupUuid);
    if (!exists) {
      throw new NotFoundException(`Group with UUID ${groupUuid} does not exist.`);
    }
    await this.prismaService.userRole.deleteMany({
      where: {
        groupUuid: groupUuid,
        userUuid: userUuid,
      },
    });
  }
  

  async groupExists(groupUuid: string): Promise<boolean> {
    const group = await this.prismaService.group.findUnique({
      where: {
        uuid: groupUuid,
      },
    });
    return !!group;
  }
  
}
