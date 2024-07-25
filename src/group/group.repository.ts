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
import { AddGroupMemberDto } from './dto/req/addGroupMember.dto';
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
          UserGroup: {
            some: {
              userUuid: userUuid,
            },
          },
        },
        include: {
          _count: {
            select: {
              UserGroup: true,
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
              UserGroup: true,
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
          UserGroup: {
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
          President: {
            connect: {
              uuid: userUuid,
            },
          },
          UserGroup: {
            create: {
              userUuid,
            },
          },
          Role: {
            create: {
              id: 1,
              name: 'admin',
              authorities: [
                Authority.GROUP_UPDATE,
                Authority.GROUP_DELETE,
                Authority.MEMBER_UPDATE,
                Authority.MEMBER_DELETE,
                Authority.ROLE_CREATE,
                Authority.ROLE_UPDATE,
                Authority.ROLE_DELETE,
              ],
              userRole: {
                create: {
                  userUuid,
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
          UserRole: {
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
          UserRole: {
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
          UserGroup: {
            some: {
              Group: {
                name,
                UserGroup: {
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
            throw new ForbiddenException('record not exist');
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
              UserRole: {
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
    groupUuid: string,
    deleteUserUuid: string,
    userUuid: string,
  ) {
    this.logger.log('deleteGroupMember');
    return this.prismaService.userGroup
      .delete({
        where: {
          userUuid_groupUuid: {
            userUuid: deleteUserUuid,
            groupUuid,
          },
          Group: {
            UserRole: {
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
            throw new ForbiddenException('record not exist');
          }
        }
        this.logger.error('deleteGroupMember');
        this.logger.debug(err);
        throw new InternalServerErrorException('Database error');
      });
  }

  async addUserRole(
    { createUserUuid, groupUuid, roleId }: CreateUserRoleDto,
    userUuid: string,
  ): Promise<void> {
    this.logger.log('addUserRole');

    await this.prismaService.userRole
      .create({
        data: {
          User: {
            connect: {
              uuid: createUserUuid,
            },
          },
          Group: {
            connect: {
              uuid: groupUuid,
              UserRole: {
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
              id_groupUuid: {
                id: roleId,
                groupUuid,
              },
            },
          },
        },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            this.logger.error(`UserRole already exists`);
            throw new ConflictException();
          }
        }
        this.logger.error('Failed to create UserRole', err);
        throw new InternalServerErrorException('Database error');
      });

    this.logger.log(`UserRole [${userUuid}, ${groupUuid}, ${roleId}] created`);
  }

  async getUserRoles(
    targetUuid: string,
    groupName: string,
    userUuid: string,
  ): Promise<Role[]> {
    this.logger.log('getUserRoles');
    return this.prismaService.role
      .findMany({
        where: {
          userRole: {
            some: {
              userUuid: targetUuid,
              Group: {
                name: groupName,
                UserGroup: {
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
        this.logger.error('getUserRoles');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async deleteUserRole(
    targetUuid: string,
    roleId: number,
    groupName: string,
    userUuid: string,
  ): Promise<void> {
    this.logger.log('deleteUserRole');

    await this.prismaService.userRole
      .deleteMany({
        where: {
          userUuid: targetUuid,
          Role: {
            id: roleId,
          },
          Group: {
            name: groupName,
            UserRole: {
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
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2025') {
            throw new NotFoundException('User role not found');
          }
        }
        this.logger.error(`Failed to delete user role: ${err.message}`);
        throw new InternalServerErrorException('Failed to delete user role');
      });
  }
}
