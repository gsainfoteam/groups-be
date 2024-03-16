import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetGroupRequestDto {
  @ApiProperty({
    example: 'Infoteam',
    description: '그룹 이름을 기반으로 그룹 정보 조회',
    required: true,
  })
  @IsString()
  name: string;
}
