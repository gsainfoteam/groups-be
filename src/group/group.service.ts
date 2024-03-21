import { Injectable } from '@nestjs/common';
import { GetGroupListRequestDto } from './dto/req/getGroupListRequest.dto';
import { GroupRepository } from './group.repository';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
import { AddGroupMemberDto } from './dto/req/addGroupMemeber.dto';

@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async getGroupList({ type }: GetGroupListRequestDto, userUuid?: string) {
    return this.groupRepository.getGroupList({ type }, userUuid);
  }

  async getGroup(name: string) {
    return this.groupRepository.getGroup(name);
  }

  async createGroup(body: CreateGroupDto) {
    return this.groupRepository.createGroup(body);
  }

  async updateGroup(name: string, body: UpdateGroupDto) {
    return this.groupRepository.updateGroup(name, body);
  }

  async deleteGroup(name: string) {
    return this.groupRepository.deleteGroup(name);
  }

  async getGroupMember(name: string) {
    return this.groupRepository.getGroupMember(name);
  }

  async addGroupMember(groupName: string, body: AddGroupMemberDto) {
    return this.groupRepository.addGroupMember(groupName, body);
  }

  async deleteGroupMember(groupName: string, userUuid: string) {
    return this.groupRepository.deleteGroupMember(groupName, userUuid);
  }
}
