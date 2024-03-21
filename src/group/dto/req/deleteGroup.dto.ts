import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteGroupDto {
  @ApiProperty({
    example: 'Infoteam',
    description: '삭제할 그룹의 이름',
    required: true,
  })
  @IsString()
  name: string;
}
