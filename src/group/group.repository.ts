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
import { Authoity, Group, Role } from '@prisma/client';
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
    this.logger.log('getGroupList');
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
    this.logger.log('getGroup');
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
    this.logger.log('createGroup');
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
    this.logger.log('updateGroup');
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
    this.logger.log('deleteGroup');
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
    this.logger.log('getGroupMember');
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
            throw new ForbiddenException("record not exist");
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
    this.logger.log('addGroupMember');
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
    this.logger.log('deleteGroupMember');
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
            throw new ForbiddenException("record not exist");
          }
        }
        this.logger.error('deleteGroupMember');
        this.logger.debug(err);
        throw new InternalServerErrorException('Database error');
      });
  }

  async addUserRole(
    { createUserUuid, groupName, roleId }: CreateUserRoleDto,
    userUuid: string,
  ): Promise<void> {
    this.logger.log('addUserRole');
    try {
      await this.prismaService.userRole.create({
        data: {
          User: {
            connect: {
              uuid: createUserUuid,
            },
          },
          Group: {
            connect: {
              name: groupName,
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
          Role: {
            connect: {
              id_groupName: {
                id: roleId,
                groupName,
              },
            },
          },
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

  async getUserRoles(
    targetUuid: string,
    groupName: string,
    userUuid: string,
  ): Promise<Role[]> {
    this.logger.log('getUserRoles');
    return this.prismaService.role.findMany({
      where: {
        userRoles: {
          some: {
            userUuid: targetUuid,
            Group: {
              name: groupName,
              users: {
                some: {
                  userUuid,
                },
              },
            },
          },
        },
      },
    });
  }

  async deleteUserRole(
    targetUuid: string,
    roleId: number,
    groupName: string,
    userUuid: string,
  ): Promise<void> {
    this.logger.log('deleteUserRole');
    try {
      await this.prismaService.userRole.deleteMany({
        where: {
          userUuid: targetUuid,
          Role: {
            id: roleId,
          },
          Group: {
            name: groupName,
            userRoles: {
              some: {
                User: {
                  uuid: userUuid,
                },
                Role: {
                  authoities: {
                    has: Authoity.MEMBER_DELETE,
                  },
                },
              },
            },
          },
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException('User role not found');
        }
      }
      this.logger.error(`Failed to delete user role: ${err.message}`);
      throw new InternalServerErrorException('Failed to delete user role');
    }
  }
}
