import { ApiProperty } from '@nestjs/swagger';

export class AddGroupMemberDto {
  @ApiProperty({
    description: '그룹에 추가하고자 하는 user의 uuid',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  uuid: string;
}
