import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { GroupRepository } from './group.repository';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { GroupListResDto, GroupResDto } from './dto/res/groupRes.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { InviteCodeResDto } from './dto/res/inviteCodeRes.dto';
import * as crypto from 'crypto';
import { Authority } from '@prisma/client';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);
  private readonly inviteCodePrefix = 'inviteCode';
  constructor(
    private readonly groupRepository: GroupRepository,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async getGroupList(userUuid: string): Promise<GroupListResDto> {
    this.logger.log(`getGroupList`);
    return { list: await this.groupRepository.getGroupList(userUuid) };
  }

  async getGroup(uuid: string, userUuid: string): Promise<GroupResDto> {
    this.logger.log(`getGroup: ${uuid}`);
    return this.groupRepository.getGroup(uuid, userUuid);
  }

  async createGroup(
    createGroupDto: CreateGroupDto,
    userUuid: string,
  ): Promise<void> {
    this.logger.log(`createGroup: ${createGroupDto.name}`);
    await this.groupRepository.createGroup(createGroupDto, userUuid);
  }

  async deleteGroup(uuid: string, userUuid: string): Promise<void> {
    this.logger.log(`deleteGroup: ${uuid}`);
    if (
      !(await this.groupRepository.validateAuthority(
        uuid,
        [Authority.GROUP_DELETE],
        userUuid,
      ))
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete group',
      );
    }
    await this.groupRepository.deleteGroup(uuid);
  }

  async createInviteCode(
    uuid: string,
    userUuid: string,
  ): Promise<InviteCodeResDto> {
    this.logger.log(`createInviteCode: ${uuid}`);
    if (
      !(await this.groupRepository.validateAuthority(
        uuid,
        [Authority.MEMBER_UPDATE],
        userUuid,
      ))
    ) {
      throw new ForbiddenException(
        'You do not have permission to create an invite code',
      );
    }
    const code = crypto
      .randomBytes(32)
      .toString('base64')
      .replace(/[+\/=]/g, '');
    await this.redis.set(`${this.inviteCodePrefix}:${code}`, uuid);
    return { code };
  }

  async joinMember(code: string, userUuid: string): Promise<void> {
    this.logger.log(`updateMember: ${code}`);
    const uuid = await this.redis.get(`${this.inviteCodePrefix}:${code}`);
    if (!uuid) {
      throw new ForbiddenException('Invalid invite code');
    }
    await this.groupRepository.addUserToGroup(uuid, userUuid);
  }
}
