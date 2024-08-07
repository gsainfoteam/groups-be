import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Authority, Group } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GroupRepository {
  private readonly logger = new Logger(GroupRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async getGroupList(userUuid: string): Promise<Group[]> {
    this.logger.log(`getGroupList`);
    return this.prismaService.group.findMany({
      where: {
        UserGroup: {
          some: {
            userUuid,
          },
        },
      },
    });
  }

  async getGroup(uuid: string, userUuid: string): Promise<Group> {
    this.logger.log(`getGroup: ${uuid}`);
    return this.prismaService.group
      .findUniqueOrThrow({
        where: {
          uuid,
          UserGroup: {
            some: {
              userUuid,
            },
          },
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new ForbiddenException('Group not found');
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
    await this.prismaService.group.delete({
      where: {
        uuid,
      },
    });
  }

  async addUserToGroup(uuid: string, userUuid: string): Promise<void> {
    this.logger.log(`addUserToGroup: ${uuid}`);
    await this.prismaService.userGroup.create({
      data: {
        userUuid,
        groupUuid: uuid,
      },
    });
  }
}
