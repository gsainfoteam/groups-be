import {
  ConflictException,
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

  async getGroup(name: string) {
    return this.prismaService.group
      .findUniqueOrThrow({
        where: {
          name: name,
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
        console.log(err);
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            throw new ConflictException(
              `group with name '${name}' already exists`,
            );
          }
          if (err.code === 'P2025') {
            throw new NotFoundException(
              `group with name '${currentName}' does not exist`,
            );
          }
        }
        this.logger.error('updateGroup');
        this.logger.debug(err);
        throw new InternalServerErrorException('database error');
      });
  }

  async deleteGroup(name: string) {
    return this.prismaService.group
      .delete({
        where: { name: name },
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

  async getGroupMember(name: string) {
    return this.prismaService.user
      .findMany({
        where: {
          groups: {
            some: {
              groupName: name,
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
    return this.prismaService.userGroup
      .create({
        data: {
          userUuid: newUserUuid,
          groupName,
        },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            throw new ConflictException(
              `User already exists in group '${groupName}'`,
            );
          }
          if (err.code === 'P2003') {
            throw new NotFoundException(
              `group with name '${groupName}' does not exist`,
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
            throw new NotFoundException(
              `user does not exist in group '${groupName}' or group with name '${groupName}' does not exist`,
            );
          }
        }
        this.logger.error('deleteGroupMember');
        this.logger.debug(err);
        throw new InternalServerErrorException('Database error');
      });
  }
}
