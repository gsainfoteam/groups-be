import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GroupRepository } from './group.repository';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { InviteCodeResDto } from './dto/res/inviteCodeRes.dto';
import * as crypto from 'crypto';
import { Authority, Group, Visibility, User, Role } from '@prisma/client';
import { GroupWithRole } from './types/groupWithRole';
import { ExpandedGroup } from './types/ExpandedGroup.type';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
import { CheckGroupExistenceByNameDto } from './dto/res/checkGroupExistenceByName.dto';
import { GroupCreateResDto } from './dto/res/groupCreateRes.dto';
import { ConfigService } from '@nestjs/config';
import { ExpandedUser } from './types/ExpandedUser';
import { GetGroupByNameQueryDto } from './dto/req/getGroup.dto';
import { Loggable } from '@lib/logger/decorator/loggable';
import { ObjectService } from '@lib/object';
import { InviteCache } from './types/InviteCache.type';

@Injectable()
@Loggable()
export class GroupService {
  private readonly invitationCodePrefix = 'invitationCode';
  constructor(
    private readonly groupRepository: GroupRepository,
    @InjectRedis() private readonly redis: Redis,
    private readonly objectService: ObjectService,
    private readonly configService: ConfigService,
  ) {}

  async getGroupList(userUuid: string): Promise<Group[]> {
    return this.groupRepository.getGroupList(userUuid);
  }

  async getGroupByUuidWithUserUuid(
    uuid: string,
    userUuid?: string,
  ): Promise<ExpandedGroup> {
    return this.groupRepository.getGroupByUuid(uuid, userUuid);
  }

  async getGroupListByGroupNameQuery(
    groupNameQuery: GetGroupByNameQueryDto,
  ): Promise<Group[]> {
    return this.groupRepository.getGroupListByGroupNameQuery(groupNameQuery);
  }

  async checkGroupExistenceByName(
    name: string,
  ): Promise<CheckGroupExistenceByNameDto> {
    const checkGroupExistence =
      await this.groupRepository.checkGroupExistenceByName(name);

    if (checkGroupExistence) {
      return { exist: true };
    } else {
      return { exist: false };
    }
  }

  async createGroup(
    createGroupDto: CreateGroupDto,
    userUuid: string,
  ): Promise<GroupCreateResDto> {
    const checkGroupExistence = await this.checkGroupExistenceByName(
      createGroupDto.name,
    );

    if (checkGroupExistence.exist) {
      throw new ConflictException(
        `Group with name ${createGroupDto.name} already exists`,
      );
    }

    return this.groupRepository.createGroup(createGroupDto, userUuid);
  }

  async updateGroup(
    updateGroupDto: UpdateGroupDto,
    groupUuid: string,
    userUuid: string,
  ): Promise<void> {
    const checkGroupExistence =
      await this.groupRepository.checkGroupExistenceByUuid(groupUuid);

    if (!checkGroupExistence) {
      throw new NotFoundException('Group not found');
    }

    await this.groupRepository.updateGroup(updateGroupDto, groupUuid, userUuid);
  }

  async uploadGroupImage(
    file: Express.Multer.File,
    groupUuid: string,
    userUuid: string,
  ): Promise<void> {
    const checkGroupExistence =
      await this.groupRepository.checkGroupExistenceByUuid(
        groupUuid,
        userUuid,
        Authority.GROUP_UPDATE,
      );

    if (!checkGroupExistence) {
      throw new NotFoundException('Group not found');
    }
    if (checkGroupExistence.UserRole.length === 0) {
      throw new ForbiddenException(
        'You do not have permission to upload image',
      );
    }

    const key = `group/${groupUuid}/image/${Date.now().toString()}-${file.originalname}`;

    await this.objectService.uploadObject(key, file);

    await this.groupRepository.updateGroupImage(key, groupUuid);
  }

  async deleteGroup(uuid: string, userUuid: string): Promise<void> {
    const checkGroupExistence =
      await this.groupRepository.checkGroupExistenceByUuid(uuid);

    if (!checkGroupExistence) {
      throw new NotFoundException('Group not found');
    }

    await this.groupRepository.deleteGroup(uuid, userUuid);

    if (checkGroupExistence.profileImageKey) {
      await this.objectService.deleteObject(
        checkGroupExistence.profileImageKey,
      );
    }
  }

  getUserRoleInGroup(uuid: string, userUuid: string): Promise<Role> {
    return this.groupRepository.getUserRoleInGroup(uuid, userUuid);
  }

  /**
   * this method creates an invite code for a group, and the expiration time is 14 days.
   * @param uuid uuid of the group
   * @param userUuid uuid of the user who is creating the invite code
   * @returns the invite code
   */
  async createInviteCode(
    uuid: string,
    roleId: number,
    userUuid: string,
    duration: number = 60 * 60,
  ): Promise<InviteCodeResDto> {
    if (
      !(await this.groupRepository.validateAuthority(
        uuid,
        [Authority.MEMBER_UPDATE, Authority.ROLE_GRANT],
        userUuid,
      ))
    ) {
      throw new ForbiddenException(
        'You do not have permission to create an invite code',
      );
    }
    const role = await this.groupRepository.getUserRoleInGroup(uuid, userUuid);
    if (role.id > roleId) {
      throw new ForbiddenException(
        'You do not have permission to grant a role higher than yours',
      );
    }
    const code = crypto
      .randomBytes(32)
      .toString('base64')
      .replace(/[+\/=]/g, '');
    const inviteCache: InviteCache = {
      groupUuid: uuid,
      roleId,
    };
    await this.redis.set(
      `${this.invitationCodePrefix}:${code}`,
      JSON.stringify(inviteCache),
      'EX',
      duration,
    );
    return { code };
  }

  async getInvitationInfo(code: string): Promise<ExpandedGroup> {
    const cache = await this.redis.get(`${this.invitationCodePrefix}:${code}`);

    if (!cache) {
      throw new ForbiddenException('Invalid invite code');
    }

    const inviteCache: InviteCache = JSON.parse(cache);

    return this.groupRepository.getGroupByUuid(inviteCache.groupUuid);
  }

  async joinMember(code: string, userUuid: string): Promise<void> {
    const cache = await this.redis.get(`${this.invitationCodePrefix}:${code}`);
    if (!cache) {
      throw new ForbiddenException('Invalid invite code');
    }

    const inviteCache: InviteCache = JSON.parse(cache);
    await this.groupRepository.addUserToGroup(
      inviteCache.groupUuid,
      inviteCache.roleId,
      userUuid,
    );
  }

  async getMembersByGroupUuid(
    groupUuid: string,
    user: User,
  ): Promise<ExpandedUser[]> {
    const members = await this.groupRepository.getMembersByGroupUuid(
      groupUuid,
      user,
    );
    const admin = await this.groupRepository.isUserAdmin(user);
    if (!admin) {
      const filteredMembers = members.map((member) => ({
        ...member,
        email: null,
        role: null,
      }));
      return filteredMembers;
    }
    return members;
  }

  async removeMember(
    uuid: string,
    targetUuid: string,
    userUuid: string,
  ): Promise<void> {
    if (
      !(await this.groupRepository.validateAuthority(
        uuid,
        [Authority.MEMBER_DELETE],
        userUuid,
      ))
    ) {
      throw new ForbiddenException(
        'You do not have permission to remove a member',
      );
    }

    const groupInfo = await this.groupRepository.getGroupByUuid(uuid);

    if (groupInfo.President.uuid === targetUuid) {
      throw new ForbiddenException(
        groupInfo.President.uuid === userUuid
          ? 'You cannot remove yourself from the group'
          : 'You cannot remove the president',
      );
    }

    await this.groupRepository.removeUserFromGroup(uuid, targetUuid);
  }

  async leaveFromGroup(uuid: string, userUuid: string): Promise<void> {
    const groupInfo = await this.groupRepository.getGroupByUuid(uuid);

    if (!groupInfo) {
      throw new NotFoundException('Group does not exist');
    }

    if (groupInfo.President.uuid === userUuid) {
      throw new ForbiddenException(
        'You cannot leave as the president, transfer ownership first',
      );
    }
    await this.groupRepository.removeUserFromGroupSelf(uuid, userUuid);
  }

  async grantRole(
    uuid: string,
    targetUuid: string,
    roleId: number,
    userUuid: string,
  ): Promise<void> {
    if (
      !(await this.groupRepository.validateAuthority(
        uuid,
        [Authority.ROLE_GRANT],
        userUuid,
      ))
    ) {
      throw new ForbiddenException('You do not have permission to grant role');
    }
    await this.groupRepository.addRoleToUser(uuid, roleId, targetUuid);
  }

  async revokeRole(
    uuid: string,
    targetUuid: string,
    roleId: number,
    userUuid: string,
  ): Promise<void> {
    if (
      !(await this.groupRepository.validateAuthority(
        uuid,
        [Authority.ROLE_REVOKE],
        userUuid,
      ))
    ) {
      throw new ForbiddenException('You do not have permission to revoke role');
    }
    await this.groupRepository.removeRoleFromUser(uuid, roleId, targetUuid);
  }

  async getGroupListWithRole(
    userUuid: string,
    clientUuid: string,
  ): Promise<GroupWithRole[]> {
    return this.groupRepository.getGroupListWithRole(userUuid, clientUuid);
  }

  async updateUserVisibilityInGroup(
    userUuid: string,
    groupUuid: string,
    visibility: Visibility,
  ): Promise<void> {
    await this.groupRepository.updateUserVisibilityInGroup(
      userUuid,
      groupUuid,
      visibility,
    );
  }

  async changePresident(
    previousPresidentUuid: string,
    newPresidentUuid: string,
    groupUuid: string,
  ): Promise<void> {
    await this.groupRepository.changePresident(
      previousPresidentUuid,
      newPresidentUuid,
      groupUuid,
    );
  }
}
