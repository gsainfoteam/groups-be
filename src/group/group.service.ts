import { Injectable } from '@nestjs/common';
import { GroupRepository } from './group.repository';
import { CreateGroupDto } from './dto/req/createGroup.dto';
import { GroupListResDto, GroupResDto } from './dto/res/groupRes.dto';

@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async getGroupList(userUuid: string): Promise<GroupListResDto> {
    return { list: await this.groupRepository.getGroupList(userUuid) };
  }

  async getGroup(uuid: string, userUuid: string): Promise<GroupResDto> {
    return this.groupRepository.getGroup(uuid, userUuid);
  }

  async createGroup(
    createGroupDto: CreateGroupDto,
    userUuid: string,
  ): Promise<void> {
    await this.groupRepository.createGroup(createGroupDto, userUuid);
  }
}
