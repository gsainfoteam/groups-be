import { Delete, Injectable, NotFoundException, Param } from '@nestjs/common';
import { GetGroupListRequestDto } from './dto/req/getGroupListRequest.dto';
import { GroupRepository } from './group.repository';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
import { DeleteGroupDto } from './dto/req/deleteGroup.dto';
import { CreateUserRoleDto } from './dto/req/createUserRole.dto';
import { AddGroupMemberDto } from './dto/req/addGroupMemeber.dto';

@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async getGroupList({ type }: GetGroupListRequestDto, userUuid?: string) {
    return this.groupRepository.getGroupList({ type }, userUuid);
  }

  async getGroup(name: string, userUuid: string) {
    return this.groupRepository.getGroup(name, userUuid);
  }

  async createGroup(body: CreateGroupDto, userUuid: string) {
    return this.groupRepository.createGroup(body, userUuid);
  }

  async updateGroup(name: string, body: UpdateGroupDto, userUuid: string) {
    return this.groupRepository.updateGroup(name, body, userUuid);
  }

  async deleteGroup(name: string, userUuid: string) {
    return this.groupRepository.deleteGroup(name, userUuid);
  }

  async getGroupMember(name: string, userUuid: string) {
    return this.groupRepository.getGroupMember(name, userUuid);
  }

  async addGroupMember(
    groupName: string,
    body: AddGroupMemberDto,
    userUuid: string,
  ) {
    return this.groupRepository.addGroupMember(groupName, body, userUuid);
  }

  async deleteGroupMember(
    groupName: string,
    deleteUserUuid: string,
    userUuid: string,
  ) {
    return this.groupRepository.deleteGroupMember(
      groupName,
      deleteUserUuid,
      userUuid,
    );
  }

  async addUserRole(createUserRoleDto: CreateUserRoleDto): Promise<void> {
    return this.groupRepository.addUserRole(createUserRoleDto);
  }
  
  async getUserRoles(user_uuid: string, group_uuid: string): Promise<number[]> {
    return this.groupRepository.getUserRoles(user_uuid, group_uuid);
  }
  
  async getUsersByRole(group_uuid: string, role_id: number): Promise<string[]> {
    return this.groupRepository.getUsersByRole(group_uuid, role_id);
  }
  
  async deleteGroupRoles(groupUuid: string): Promise<void> {
    await this.groupRepository.deleteGroupRoles(groupUuid);
  }
  
  async deleteUserRoles(userUuid: string): Promise<void> {
    await this.groupRepository.deleteUserRoles(userUuid);
  }

  async deleteGroupMemberRoles(groupUuid: string, userUuid: string): Promise<void> {
    await this.groupRepository.deleteGroupMemberRoles(groupUuid, userUuid);
  }
  
}
