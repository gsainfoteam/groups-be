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
import { PrismaService } from 'src/prisma/prisma.service';
import { GroupWithRole } from './types/groupWithRole';
import { ExpandedGroup } from './types/ExpandedGroup.type';
import { GroupWithUserRole } from './types/groupwithUserRole.type';
import { GroupCreateResDto } from './dto/res/groupCreateRes.dto';
import { ConfigService } from '@nestjs/config';
import { ExpandedUser } from './types/ExpandedUser';

@Injectable()
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
    this.logger.log(`getGroupList`);
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
    this.logger.log(`getGroupListWithRole`);
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

  async getGroupByUuid(uuid: string, userUuid: string): Promise<ExpandedGroup> {
    this.logger.log(`getGroupByUuid: ${uuid}`);
    return this.extendPrismaWithProfileImageUrl(this.s3Url)
      .group.findUniqueOrThrow({
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

  async checkGroupExistenceByUuid(
    uuid: string,
    userUuid?: string,
    authority?: Authority,
  ): Promise<GroupWithUserRole | null> {
    this.logger.log(`checkGroupExistenceByUuid ${uuid}`);

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
    this.logger.log(`checkGroupExistenceByName groupName: ${name}`);
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
      notionPageId,
    }: Pick<Group, 'name'> &
      Partial<Pick<Group, 'description' | 'notionPageId'>>,
    userUuid: string,
    s3Url?: string,
  ): Promise<GroupCreateResDto> {
    this.logger.log(`createGroup: ${name}`);
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

  async updateGroup(
    {
      name,
      description,
      notionPageId,
    }: Partial<Pick<Group, 'name' | 'description' | 'notionPageId'>>,
    groupUuid: string,
    userUuid: string,
  ): Promise<void> {
    this.logger.log(`updateGroup ${groupUuid}`);

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
          this.logger.log(error);
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
    this.logger.log(`deleteGroup: ${uuid}`);

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
          this.logger.log(error);
          throw new InternalServerErrorException('unknown database error');
        }
        throw new InternalServerErrorException('unknown error');
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
          } else if (error.code === 'P2002') {
            throw new ConflictException('User already exists in this group');
          }
          this.logger.log(error);
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
    this.logger.log(`getMembersByGroupUuid: ${groupUuid}`);
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
    //expandedUser type에 맞게 변환 과정 추가
    const expandedUsers: ExpandedUser[] = userGroups.map((group) => ({
      uuid: group.User.uuid,
      name: group.User.name,
      email: group.User.email,
      createdAt: group.User.createdAt,
      role: group.User.UserRole[0]?.Role.name || '', // 첫 번째 역할의 이름을 가져오고, 없으면 빈 문자열
    }));
    return expandedUsers;
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

  async updateUserVisibilityInGroup(
    userUuid: string,
    groupUuid: string,
    visibility: Visibility,
  ): Promise<void> {
    this.logger.log(
      `update 'visibility' of user ${userUuid} in group ${groupUuid}`,
    );

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
          this.logger.log(error);
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
    this.logger.log(
      `change president from ${previousPresidentUuid} to ${newPresidentUuid}`,
    );

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
            this.logger.log(error, error.code);
            throw new NotFoundException(
              'New president is not a group member or previous user is not a president of the group',
            );
          }
          this.logger.log(error);
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
