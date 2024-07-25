import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: '그룹의 이름',
    example: 'Infoteam',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '그룹에 대한 설명',
    example: 'Infoteam is...',
  })
  @IsString()
  description?: string;
}
