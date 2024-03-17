import { Injectable } from '@nestjs/common';
import { GetGroupListRequestDto } from './dto/req/getGroupListRequest.dto';
import { GroupRepository } from './group.repository';
import { GetGroupRequestDto } from './dto/req/getGroupRequest.dto';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { UpdateGroupDto } from './dto/req/updateGroup.dto';
import { DeleteGroupDto } from './dto/req/deleteGroup.dto';
import { CreateUserRoleDto } from './dto/req/createUserRole.dto';

@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async getGroupList({ type }: GetGroupListRequestDto, userUuid?: string) {
    return this.groupRepository.getGroupList({ type }, userUuid);
  }

  async getGroup({ name }: GetGroupRequestDto) {
    return this.groupRepository.getGroup({ name });
  }

  async createGroup(body: CreateGroupDto) {
    return this.groupRepository.createGroup(body);
  }

  async updateGroup(name: string, body: UpdateGroupDto) {
    return this.groupRepository.updateGroup(name, body);
  }

  async deleteGroup({ name }: DeleteGroupDto) {
    return this.groupRepository.deleteGroup({ name });
  }

  // user-role part
  async addUserRole(createUserRoleDto: CreateUserRoleDto): Promise<void> {
    return this.groupRepository.addUserRole(createUserRoleDto);
  }
  
  async getUserRoles(user_uuid: string, group_uuid: string): Promise<number[]> {
    return this.groupRepository.getUserRoles(user_uuid, group_uuid);
  }
  
  async getUsersByRole(group_uuid: string, role_id: number): Promise<string[]> {
    return this.groupRepository.getUsersByRole(group_uuid, role_id);
  }
  
}
