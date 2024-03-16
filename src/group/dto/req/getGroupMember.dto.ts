import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetGroupMember {
  @ApiProperty({
    example: 'Infoteam',
    description: '그룹 이름을 통해 그룹 멤버를 조회',
    required: true,
  })
  @IsString()
  name: string;
}
