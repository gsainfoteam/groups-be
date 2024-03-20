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
import { Group } from '@prisma/client';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
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

  // 테스트 완료
  async getGroup(name: string) {
    console.log(`repository ${name}`);
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

  // 테스트 완료
  async createGroup({ name, description }: CreateGroupDto) {
    return this.prismaService.group
      .create({
        data: { name, description },
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

  // 테스트 완료
  async updateGroup(
    currentName: string,
    { name, description }: UpdateGroupDto,
  ) {
    return this.prismaService.group
      .update({
        where: { name: currentName },
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

  // 테스트 완료
  async deleteGroup(name: string) {
    return this.prismaService.group
      .delete({
        where: { name: name },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2025') {
            throw new NotFoundException();
          }
        }
        this.logger.error('deleteNotice');
        this.logger.debug(err);
        throw new InternalServerErrorException('Database error');
      });
  }

  async getGroupMember(name: string) {
    return this.prismaService.user
      .findMany({
        where: {
          groups: {
            some: {
              Group: { name: name },
            },
          },
        },
      })
      .catch((err) => {
        this.logger.error('getGroupMember');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async addGroupMember(
    groupName: string,
    { uuid: newUserUuid }: AddGroupMemberDto,
  ) {
    return this.prismaService.user
      .create({
        data: {
          uuid: newUserUuid,
          groups: {
            create: [
              {
                Group: {
                  connect: {
                    name: groupName,
                  },
                },
              },
            ],
          },
        },
      })
      .catch((err) => {
        console.log(err);
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            throw new ConflictException(
              `User already exists in group ${groupName}`,
            );
          }
        }
        this.logger.error('addGroupMember');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async deleteGroupMember(groupName: string, userUuid: string) {
    return this.prismaService.userGroup
      .delete({
        where: {
          userUuid_groupName: {
            userUuid,
            groupName,
          },
        },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2025') {
            throw new ForbiddenException();
          }
        }
        this.logger.error('deleteGroupMember');
        this.logger.debug(err);
        throw new InternalServerErrorException('Database error');
      });
  }
}
