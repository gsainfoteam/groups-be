import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Authority, Group } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';
import { GroupWithRole } from './types/groupWithRole';
import { ExpandedGroup } from './types/ExpandedGroup.type';

@Injectable()
export class GroupRepository {
  private readonly logger = new Logger(GroupRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async getGroupList(userUuid: string): Promise<Group[]> {
    this.logger.log(`getGroupList`);
    return this.prismaService.group.findMany({
      where: {
        deletedAt: null,
        UserGroup: {
          some: {
            userUuid,
          },
        },
      },
    });
  }

  async getGroupListWithRole(
    userUuid: string,
    clientUuid: string,
  ): Promise<GroupWithRole[]> {
    this.logger.log(`getGroupListWithRole`);
    return this.prismaService.group.findMany({
      where: {
        deletedAt: null,
        UserGroup: {
          some: {
            userUuid,
          },
        },
      },
      include: {
        Role: {
          where: {
            userRole: {
              some: {
                userUuid,
              },
            },
          },
          include: {
            RoleExternalAuthority: {
              where: clientUuid ? { clientUuid } : undefined,
            },
          },
        },
      },
    });
  }

  async getGroup(uuid: string, userUuid: string): Promise<ExpandedGroup> {
    this.logger.log(`getGroup: ${uuid}`);
    return this.prismaService.group
      .findUniqueOrThrow({
        where: {
          deletedAt: null,
          uuid,
          UserGroup: {
            some: {
              userUuid,
            },
          },
        },
        include: {
          President: true,
          _count: {
            select: {
              UserGroup: true,
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new NotFoundException('Group not found');
          }
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }

  async validateAuthority(
    uuid: string,
    authorities: Authority[],
    userUuid: string,
  ): Promise<Group | null> {
    this.logger.log(`validateAuthority: ${uuid}, ${authorities}`);
    return this.prismaService.group.findUnique({
      where: {
        uuid,
        UserRole: {
          some: {
            userUuid,
            Role: {
              authorities: {
                hasSome: authorities,
              },
            },
          },
        },
      },
    });
  }

  async createGroup(
    {
      name,
      description,
    }: Pick<Group, 'name'> & Partial<Pick<Group, 'description'>>,
    userUuid: string,
  ): Promise<Group> {
    this.logger.log(`createGroup: ${name}`);
    return this.prismaService.group
      .create({
        data: {
          name,
          description,
          presidentUuid: userUuid,
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
                Authority.MEMBER_UPDATE,
                Authority.MEMBER_DELETE,
                Authority.ROLE_CREATE,
                Authority.ROLE_UPDATE,
                Authority.ROLE_DELETE,
                Authority.GROUP_UPDATE,
                Authority.GROUP_DELETE,
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
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ConflictException('Group name already exists');
          }
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }

  async deleteGroup(uuid: string): Promise<void> {
    this.logger.log(`deleteGroup: ${uuid}`);
    await this.prismaService.group.update({
      where: {
        uuid,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async addUserToGroup(uuid: string, userUuid: string): Promise<void> {
    this.logger.log(`addUserToGroup: ${uuid}`);
    await this.prismaService.userGroup
      .create({
        data: {
          userUuid,
          groupUuid: uuid,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new NotFoundException('Group not found');
          }
          this.logger.log(error);
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }

  async removeUserFromGroup(uuid: string, targetUuid: string): Promise<void> {
    this.logger.log(`removeUserFromGroup: ${uuid}`);
    await this.prismaService.userGroup
      .deleteMany({
        where: {
          userUuid: targetUuid,
          groupUuid: uuid,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new ForbiddenException('User not found');
          }
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }

  async addRoleToUser(
    uuid: string,
    roleId: number,
    targetUuid: string,
  ): Promise<void> {
    this.logger.log(`addRoleToUser: ${uuid}`);
    await this.prismaService.userRole
      .create({
        data: {
          groupUuid: uuid,
          userUuid: targetUuid,
          roleId,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new ForbiddenException('User not found');
          }
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }

  async removeRoleFromUser(
    uuid: string,
    roleId: number,
    targetUuid: string,
  ): Promise<void> {
    this.logger.log(`removeRoleFromUser: ${uuid}`);
    await this.prismaService.userRole
      .delete({
        where: {
          userUuid_groupUuid_roleId: {
            userUuid: targetUuid,
            roleId,
            groupUuid: uuid,
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new ForbiddenException('User not found');
          }
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }
}
