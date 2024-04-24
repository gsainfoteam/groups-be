import { Injectable } from '@nestjs/common';
import { GetGroupListRequestDto } from './dto/req/getGroupListRequest.dto';
import { GroupRepository } from './group.repository';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
import { CreateUserRoleDto } from './dto/req/createUserRole.dto';
import { AddGroupMemberDto } from './dto/req/addGroupMemeber.dto';
import { Role } from '@prisma/client';
import { DeleteUserRoleDto } from './dto/req/deleteUserRole.dto';

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

  async addUserRole(
    createUserRoleDto: CreateUserRoleDto,
    userUuid: string,
  ): Promise<void> {
    return this.groupRepository.addUserRole(createUserRoleDto, userUuid);
  }

  async getUserRoles(
    targetUuid: string,
    groupName: string,
    userUuid: string,
  ): Promise<Role[]> {
    return this.groupRepository.getUserRoles(targetUuid, groupName, userUuid);
  }

  async deleteUserRole(
    { deleteUserUuid, groupName, roleId }: DeleteUserRoleDto,
    userUuid: string,
  ): Promise<void> {
    await this.groupRepository.deleteUserRole(
      deleteUserUuid,
      roleId,
      groupName,
      userUuid,
    );
  }
}
