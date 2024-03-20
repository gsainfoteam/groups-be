import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupDto {
  @ApiProperty({
    description: '그룹의 이름',
    example: 'Infoteam',
  })
  name?: string;

  @ApiProperty({
    description: '그룹에 대한 설명',
    example: 'Infoteam is...',
  })
  description?: string;
}
