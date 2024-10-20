import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GroupRepository } from './group.repository';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { InviteCodeResDto } from './dto/res/inviteCodeRes.dto';
import * as crypto from 'crypto';
import { Authority, Group, Visibility, User } from '@prisma/client';
import { GroupWithRole } from './types/groupWithRole';
import { ExpandedGroup } from './types/ExpandedGroup.type';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
import { FileService } from 'src/file/file.service';
import { CheckGroupExistenceByNameDto } from './dto/res/checkGroupExistenceByName.dto';
import { GroupCreateResDto } from './dto/res/groupCreateRes.dto';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);
  private readonly invitationCodePrefix = 'invitationCode';
  constructor(
    private readonly groupRepository: GroupRepository,
    @InjectRedis() private readonly redis: Redis,
    private readonly fileService: FileService,
  ) {}

  async getGroupList(userUuid: string): Promise<Group[]> {
    this.logger.log(`getGroupList`);
    return this.groupRepository.getGroupList(userUuid);
  }

  async getGroupByUuid(uuid: string, userUuid: string): Promise<ExpandedGroup> {
    this.logger.log(`getGroupByUuid: ${uuid}`);
    return this.groupRepository.getGroupByUuid(uuid, userUuid);
  }

  async checkGroupExistenceByName(
    name: string,
  ): Promise<CheckGroupExistenceByNameDto> {
    this.logger.log(`checkGroupExistenceByName ${name}`);

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
    this.logger.log(`createGroup: ${createGroupDto.name}`);

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
    this.logger.log(`updateGroup: ${groupUuid}`);

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
    this.logger.log(`uploadGroupImage: ${groupUuid}`);

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

    await this.fileService.uploadFile(key, file);

    await this.groupRepository.updateGroupImage(key, groupUuid);

    if (checkGroupExistence.profileImageKey) {
      await this.fileService.deleteFile(checkGroupExistence.profileImageKey);
    }
  }

  async deleteGroup(uuid: string, userUuid: string): Promise<void> {
    this.logger.log(`deleteGroup: ${uuid}`);

    const checkGroupExistence =
      await this.groupRepository.checkGroupExistenceByUuid(uuid);

    if (!checkGroupExistence) {
      throw new NotFoundException('Group not found');
    }

    await this.groupRepository.deleteGroup(uuid, userUuid);
  }

  /**
   * this method creates an invite code for a group, and the expiration time is 14 days.
   * @param uuid uuid of the group
   * @param userUuid uuid of the user who is creating the invite code
   * @returns the invite code
   */
  async createInviteCode(
    uuid: string,
    userUuid: string,
    duration: number = 60 * 60,
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
    await this.redis.set(
      `${this.invitationCodePrefix}:${code}`,
      uuid,
      'EX',
      duration,
    );
    return { code };
  }

  async getInvitationInfo(
    code: string,
    userUuid: string,
  ): Promise<ExpandedGroup> {
    this.logger.log(`getInvitationInfo called`);

    const groupUuid = await this.redis.get(
      `${this.invitationCodePrefix}:${code}`,
    );

    if (!groupUuid) {
      throw new ForbiddenException('Invalid invite code');
    }

    return this.groupRepository.getGroupByUuid(groupUuid, userUuid);
  }

  async joinMember(code: string, userUuid: string): Promise<void> {
    this.logger.log(`updateMember: ${code}`);
    const uuid = await this.redis.get(`${this.invitationCodePrefix}:${code}`);
    if (!uuid) {
      throw new ForbiddenException('Invalid invite code');
    }
    await this.groupRepository.addUserToGroup(uuid, userUuid);
  }

  async getMembersByGroupUuid(groupUuid: string, user: User): Promise<User[]> {
    this.logger.log(`getMemberInGroup: ${groupUuid}`);
    return await this.groupRepository.getMembersByGroupUuid(groupUuid, user);
  }

  async removeMember(
    uuid: string,
    targetUuid: string,
    userUuid: string,
  ): Promise<void> {
    this.logger.log(`removeMember: ${uuid}`);
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
    await this.groupRepository.removeUserFromGroup(uuid, targetUuid);
  }

  async grantRole(
    uuid: string,
    targetUuid: string,
    roleId: number,
    userUuid: string,
  ): Promise<void> {
    this.logger.log(`grantRole: ${uuid}`);
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
    this.logger.log(`revokeRole: ${uuid}`);
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
    this.logger.log(`getGroupListWithRole`);
    return this.groupRepository.getGroupListWithRole(userUuid, clientUuid);
  }

  async updateUserVisibilityInGroup(
    userUuid: string,
    groupUuid: string,
    visibility: Visibility,
  ): Promise<void> {
    this.logger.log('updateUserVisibilityInGroup');

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
    this.logger.log('changePresident');

    await this.groupRepository.changePresident(
      previousPresidentUuid,
      newPresidentUuid,
      groupUuid,
    );
  }
}
