import { Injectable } from '@nestjs/common';
import { GetGroupListRequestDto } from './dto/req/getGroupListRequest.dto';
import { GroupRepository } from './group.repository';
// import { GetGroupListResponseDto } from './dto/res/getGroupListResponse.dto';

@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async getGroupList({ type }: GetGroupListRequestDto, userUuid?: string) {
    return this.groupRepository.getGroupList({ type }, userUuid);
  }
}
