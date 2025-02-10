import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Authority, Group, Visibility, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { GroupWithRole } from './types/groupWithRole';
import { ExpandedGroup } from './types/ExpandedGroup.type';
import { GroupWithUserRole } from './types/groupwithUserRole.type';
import { GroupCreateResDto } from './dto/res/groupCreateRes.dto';
import { ConfigService } from '@nestjs/config';
import { ExpandedUser } from './types/ExpandedUser';
import { GetGroupByNameQueryDto } from './dto/req/getGroup.dto';
import { Loggable } from '@lib/logger/decorator/loggable';
import { PrismaService } from '@lib/prisma';

@Injectable()
@Loggable()
export class GroupRepository {
  private readonly logger = new Logger(GroupRepository.name);
  private readonly s3Url: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.s3Url = `https://s3.${configService.getOrThrow<string>(
      'AWS_S3_REGION',
    )}.amazonaws.com/${configService.getOrThrow<string>('AWS_S3_BUCKET')}`;
  }

  async getGroupList(userUuid: string): Promise<Group[]> {
    return this.extendPrismaWithProfileImageUrl(this.s3Url).group.findMany({
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
    return this.extendPrismaWithProfileImageUrl(this.s3Url).group.findMany({
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
              ...(clientUuid && { where: { clientUuid } }),
            },
          },
        },
      },
    });
  }

  async getGroupByUuid(
    uuid: string,
    userUuid?: string,
  ): Promise<ExpandedGroup> {
    return this.extendPrismaWithProfileImageUrl(this.s3Url)
      .group.findUniqueOrThrow({
        where: {
          deletedAt: null,
          uuid,
          ...(userUuid && {
            UserGroup: {
              some: {
                userUuid,
              },
            },
          }),
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
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }

  async getGroupListByGroupNameQuery({
    limit,
    offset,
    query,
  }: GetGroupByNameQueryDto): Promise<Group[]> {
    return this.extendPrismaWithProfileImageUrl(this.s3Url)
      .group.findMany({
        take: limit,
        skip: offset,
        where: {
          deletedAt: null,
          name: {
            contains: query,
          },
        },
        orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
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

  async checkGroupExistenceByUuid(
    uuid: string,
    userUuid?: string,
    authority?: Authority,
  ): Promise<GroupWithUserRole | null> {
    return this.prismaService.group
      .findUnique({
        where: {
          deletedAt: null,
          uuid,
        },
        include: {
          ...(userUuid &&
            authority && {
              UserRole: {
                where: {
                  userUuid,
                  Role: {
                    authorities: {
                      has: authority,
                    },
                  },
                },
              },
            }),
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }

  async checkGroupExistenceByName(name: string): Promise<Group | null> {
    return this.prismaService.group
      .findFirst({
        where: {
          deletedAt: null,
          name,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
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
      notionPageId,
    }: Pick<Group, 'name'> &
      Partial<Pick<Group, 'description' | 'notionPageId'>>,
    userUuid: string,
    s3Url?: string,
  ): Promise<GroupCreateResDto> {
    return this.prismaService
      .$extends({
        result: {
          group: {
            profileImageUrl: {
              needs: { profileImageKey: true },
              compute(user) {
                if (!user.profileImageKey || !s3Url) return null;
                return `${s3Url}/${user.profileImageKey}`;
              },
            },
          },
        },
      })
      .group.create({
        data: {
          name,
          description,
          presidentUuid: userUuid,
          notionPageId,
          UserGroup: {
            create: {
              userUuid,
            },
          },
          Role: {
            create: [
              {
                id: 1,
                name: 'admin',
                authorities: [
                  Authority.MEMBER_UPDATE,
                  Authority.MEMBER_DELETE,
                  Authority.ROLE_CREATE,
                  Authority.ROLE_UPDATE,
                  Authority.ROLE_DELETE,
                  Authority.ROLE_GRANT,
                  Authority.ROLE_REVOKE,
                  Authority.GROUP_UPDATE,
                  Authority.GROUP_DELETE,
                ],
                userRole: {
                  create: {
                    userUuid,
                  },
                },
              },
              {
                id: 2,
                name: 'manager',
                authorities: [Authority.MEMBER_UPDATE],
              },
              {
                id: 3,
                name: 'member',
                authorities: [],
              },
            ],
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

  async updateGroup(
    {
      name,
      description,
      notionPageId,
    }: Partial<Pick<Group, 'name' | 'description' | 'notionPageId'>>,
    groupUuid: string,
    userUuid: string,
  ): Promise<void> {
    await this.prismaService.group
      .update({
        where: {
          uuid: groupUuid,
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
        data: {
          name,
          description,
          notionPageId,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new ForbiddenException();
          }
          this.logger.error(error, error.code);
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }

  async updateGroupImage(imageKey: string, groupUuid: string): Promise<void> {
    await this.prismaService.group
      .update({
        where: {
          uuid: groupUuid,
        },
        data: {
          profileImageKey: imageKey,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }

  async deleteGroup(uuid: string, userUuid: string): Promise<void> {
    await this.prismaService.group
      .update({
        where: {
          uuid,
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
        data: {
          deletedAt: new Date(),
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new ForbiddenException();
          }
          this.logger.error(error);
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }

  async addUserToGroup(uuid: string, userUuid: string): Promise<void> {
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
          } else if (error.code === 'P2002') {
            throw new ConflictException('User already exists in this group');
          }
          this.logger.error(error);
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }
  async isUserAdmin(user: User): Promise<boolean> {
    const userRole = await this.prismaService.userRole.findFirst({
      where: {
        userUuid: user.uuid,
        roleId: 1,
      },
    });
    return userRole ? true : false;
  }

  async getMembersByGroupUuid(
    groupUuid: string,
    user: User,
  ): Promise<ExpandedUser[]> {
    const userGroups = await this.prismaService.userGroup
      .findMany({
        where: {
          groupUuid,
          OR: [
            {
              Group: {
                UserGroup: {
                  some: {
                    userUuid: user.uuid,
                  },
                },
              },
            },
            { visibility: Visibility.Public },
          ],
        },
        select: {
          User: {
            select: {
              uuid: true,
              name: true,
              email: true,
              createdAt: true,
              UserRole: {
                where: { groupUuid },
                select: {
                  Role: { select: { name: true } },
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
    const expandedUsers: ExpandedUser[] = userGroups.map((group) => ({
      uuid: group.User.uuid,
      name: group.User.name,
      email: group.User.email,
      createdAt: group.User.createdAt,
      role: group.User.UserRole[0].Role.name || '',
    }));
    return expandedUsers;
  }

  async removeUserFromGroup(uuid: string, targetUuid: string): Promise<void> {
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

  async updateUserVisibilityInGroup(
    userUuid: string,
    groupUuid: string,
    visibility: Visibility,
  ): Promise<void> {
    await this.prismaService.userGroup
      .update({
        where: {
          userUuid_groupUuid: {
            userUuid,
            groupUuid,
          },
        },
        data: {
          visibility,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new ForbiddenException('User is not a group member');
          }
          this.logger.error(error);
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }

  async changePresident(
    previousPresidentUuid: string,
    newPresidentUuid: string,
    groupUuid: string,
  ): Promise<void> {
    await this.prismaService
      .$transaction([
        this.prismaService.group.update({
          where: {
            presidentUuid: previousPresidentUuid,
            uuid: groupUuid,
            AND: {
              UserGroup: {
                some: {
                  groupUuid,
                  userUuid: newPresidentUuid,
                },
              },
            },
          },
          data: {
            presidentUuid: newPresidentUuid,
          },
        }),

        this.prismaService.userRole.upsert({
          where: {
            userUuid_groupUuid_roleId: {
              groupUuid,
              userUuid: newPresidentUuid,
              roleId: 1,
            },
          },
          update: {},
          create: {
            groupUuid,
            userUuid: newPresidentUuid,
            roleId: 1,
          },
        }),
      ])
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            this.logger.error(error, error.code);
            throw new NotFoundException(
              'New president is not a group member or previous user is not a president of the group',
            );
          }
          this.logger.error(error);
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
      });
  }

  private extendPrismaWithProfileImageUrl(s3Url: string) {
    return this.prismaService.$extends({
      result: {
        group: {
          profileImageUrl: {
            needs: { profileImageKey: true },
            compute(group) {
              if (!group.profileImageKey) return null;
              return `${s3Url}/${group.profileImageKey}`;
            },
          },
        },
      },
    });
  }
}
