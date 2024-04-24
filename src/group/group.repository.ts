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
import { Authoity, Group } from '@prisma/client';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
import { CreateUserRoleDto } from './dto/req/createUserRole.dto';
import { AddGroupMemberDto } from './dto/req/addGroupMemeber.dto';

@Injectable()
export class GroupRepository {
  private readonly logger = new Logger(GroupRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async getGroupList(
    { type }: GetGroupListRequestDto,
    userUuid?: string,
  ): Promise<Group[]> {
    if (type === 'included') {
      if (!userUuid) {
        throw new ForbiddenException('User is not logged in');
      }
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

  async getGroup(name: string, userUuid: string) {
    return this.prismaService.group
      .findUniqueOrThrow({
        where: {
          name: name,
          users: {
            some: {
              userUuid,
            },
          },
        },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2025') {
            throw new NotFoundException(
              `group with name '${name}' does not exist`,
            );
          }
        }
        this.logger.error('getGroup');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async createGroup({ name, description }: CreateGroupDto, userUuid: string) {
    return this.prismaService.group
      .create({
        data: {
          name,
          description,
          users: {
            create: {
              userUuid,
            },
          },
          userRoles: {
            create: {
              User: {
                connect: {
                  uuid: userUuid,
                },
              },
              Role: {
                create: {
                  id: 1,
                  name: 'admin',
                  groupName: name,
                  authoities: [
                    Authoity.MEMBER_UPDATE,
                    Authoity.MEMBER_DELETE,
                    Authoity.GROUP_DELETE,
                    Authoity.GROUP_UPDATE,
                    Authoity.ROLE_DELETE,
                    Authoity.ROLE_UPDATE,
                    Authoity.ROLE_CREATE,
                  ],
                },
              },
            },
          },
        },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            throw new ConflictException(
              `group with name '${name}' already exists`,
            );
          }
        }
        this.logger.error('createGroup');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async updateGroup(
    name: string,
    { description }: UpdateGroupDto,
    userUuid: string,
  ) {
    return this.prismaService.group
      .update({
        where: {
          name,
          userRoles: {
            some: {
              userUuid,
              Role: {
                authoities: {
                  has: Authoity.GROUP_UPDATE,
                },
              },
            },
          },
        },
        data: { description },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2025') {
            throw new NotFoundException(
              `group with name '${name}' does not exist`,
            );
          }
        }
        this.logger.error('updateGroup');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async deleteGroup(name: string, userUuid: string) {
    return this.prismaService.group
      .delete({
        where: {
          name: name,
          userRoles: {
            some: {
              userUuid,
              Role: {
                authoities: {
                  has: Authoity.GROUP_DELETE,
                },
              },
            },
          },
        },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2025') {
            throw new NotFoundException(
              `group with name '${name}' does not exist`,
            );
          }
        }
        this.logger.error('deleteNotice');
        this.logger.debug(err);
        throw new InternalServerErrorException('Database error');
      });
  }

  async getGroupMember(name: string, userUuid: string) {
    return this.prismaService.user
      .findMany({
        where: {
          groups: {
            some: {
              Group: {
                name,
                users: {
                  some: {
                    userUuid,
                  },
                },
              },
            },
          },
        },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2025') {
            throw new ForbiddenException("User doesn't have permission");
          }
        }
        this.logger.error('getGroupMember');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async addGroupMember(
    name: string,
    { uuid: newUserUuid }: AddGroupMemberDto,
    userUuid: string,
  ) {
    return this.prismaService.userGroup
      .create({
        data: {
          User: {
            connect: {
              uuid: newUserUuid,
            },
          },
          Group: {
            connect: {
              name,
              userRoles: {
                some: {
                  userUuid,
                  Role: {
                    authoities: {
                      has: Authoity.MEMBER_UPDATE,
                    },
                  },
                },
              },
            },
          },
        },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            throw new ConflictException(
              `User already exists in group '${name}'`,
            );
          }
          if (err.code === 'P2003') {
            throw new ForbiddenException("User doesn't have permission");
          }
        }
        this.logger.error('addGroupMember');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async deleteGroupMember(
    groupName: string,
    deleteUserUuid: string,
    userUuid: string,
  ) {
    return this.prismaService.userGroup
      .delete({
        where: {
          userUuid_groupName: {
            userUuid: deleteUserUuid,
            groupName,
          },
          Group: {
            userRoles: {
              some: {
                userUuid,
                Role: {
                  authoities: {
                    has: Authoity.MEMBER_DELETE,
                  },
                },
              },
            },
          },
        },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2025') {
            throw new ForbiddenException("User doesn't have permission");
          }
        }
        this.logger.error('deleteGroupMember');
        this.logger.debug(err);
        throw new InternalServerErrorException('Database error');
      });
  }

  async addUserRole({
    userUuid,
    groupName,
    roleId,
  }: CreateUserRoleDto): Promise<void> {
    const exists = await this.groupExists(groupName);
    if (!exists) {
      throw new NotFoundException(
        `Group with UUID ${groupName} does not exist.`,
      );
    }
    try {
      await this.prismaService.userRole.create({
        data: {
          userUuid: userUuid,
          groupName: groupName,
          roleId: roleId,
        },
      });
      this.logger.log(
        `UserRole [${userUuid}, ${groupName}, ${roleId}] created`,
      );
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
        groupName: group_uuid,
      },
      select: {
        roleId: true,
      },
    });

    if (!roles.length) {
      throw new NotFoundException(
        `No roles found for user ${user_uuid} in group ${group_uuid}`,
      );
    }

    return roles.map((role) => role.roleId);
  }

  async getUsersByRole(group_uuid: string, role_id: number): Promise<string[]> {
    const users = await this.prismaService.userRole.findMany({
      where: {
        groupName: group_uuid,
        roleId: role_id,
      },
      select: {
        userUuid: true,
      },
    });

    if (!users.length) {
      throw new NotFoundException(
        `No users found with role ${role_id} in group ${group_uuid}`,
      );
    }

    return users.map((user) => user.userUuid);
  }

  async deleteGroupRoles(groupUuid: string): Promise<void> {
    const exists = await this.groupExists(groupUuid);
    if (!exists) {
      throw new NotFoundException(
        `Group with UUID ${groupUuid} does not exist.`,
      );
    }

    await this.prismaService.userRole.deleteMany({
      where: {
        groupName: groupUuid,
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

  async deleteGroupMemberRoles(
    groupUuid: string,
    userUuid: string,
  ): Promise<void> {
    const exists = await this.groupExists(groupUuid);
    if (!exists) {
      throw new NotFoundException(
        `Group with UUID ${groupUuid} does not exist.`,
      );
    }
    await this.prismaService.userRole.deleteMany({
      where: {
        groupName: groupUuid,
        userUuid: userUuid,
      },
    });
  }

  async groupExists(groupUuid: string): Promise<boolean> {
    const group = await this.prismaService.group.findUnique({
      where: {
        name: groupUuid,
      },
    });
    return !!group;
  }
}
