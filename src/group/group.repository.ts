import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Authority, Role } from '@prisma/client';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
import { CreateUserRoleDto } from './dto/req/createUserRole.dto';
import { AddGroupMemberDto } from './dto/req/addGroupMemeber.dto';
import { GroupFullContent } from './types/GroupListResponseType';

@Injectable()
export class GroupRepository {
  private readonly logger = new Logger(GroupRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async getIncludedGroupList(userUuid: string): Promise<GroupFullContent[]> {
    this.logger.log('getIncludedGroupList');

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
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      })
      .catch((err) => {
        this.logger.error('getIncludedGroupList');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async getAllGroupList(userUuid: string): Promise<GroupFullContent[]> {
    this.logger.log('getAllGroupList');

    if (!userUuid) {
      throw new ForbiddenException('User is not logged in');
    }

    return this.prismaService.group
      .findMany({
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
      })
      .catch((err) => {
        this.logger.error('getAllGroupList');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
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
          presidentUuid: userUuid,
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
                  authorities: [
                    Authority.MEMBER_UPDATE,
                    Authority.MEMBER_DELETE,
                    Authority.GROUP_DELETE,
                    Authority.GROUP_UPDATE,
                    Authority.ROLE_DELETE,
                    Authority.ROLE_UPDATE,
                    Authority.ROLE_CREATE,
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
                authorities: {
                  has: Authority.GROUP_UPDATE,
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
                authorities: {
                  has: Authority.GROUP_DELETE,
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
                    authorities: {
                      has: Authority.MEMBER_UPDATE,
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
                  authorities: {
                    has: Authority.MEMBER_DELETE,
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
                    authorities: {
                      has: Authority.MEMBER_UPDATE,
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
                authorities: {
                  has: Authority.MEMBER_DELETE,
                },
              },
            },
          },
        },
      },
    });
  }
}
