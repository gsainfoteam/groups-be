import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import {
  GroupListRequestType,
  groupListRequestType,
} from '../../types/GroupListRequestType';

export class GetGroupListRequestDto {
  @ApiProperty({
    example: 'included',
    description: '그룹 리스트 조회',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsEnum(groupListRequestType, {
    message: 'requestType must be a valid request type',
  })
  type?: Readonly<GroupListRequestType>;
}
