import { Injectable } from '@nestjs/common';
import { GetGroupListRequestDto } from './dto/req/getGroupListRequest.dto';
import { GroupRepository } from './group.repository';
import { GetGroupRequestDto } from './dto/req/getGroupRequest.dto';
import { CreateGroupDto } from './dto/req/createGroup.dto';

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
}
