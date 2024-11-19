import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';
import { IsNumber, IsString } from 'class-validator';

export class GetGroupByNameQueryDto {
  @ApiProperty({
    example: '0',
    description: '넘길 그룹 개수',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  offset?: number;

  @ApiProperty({
    example: '10',
    description: '페이지당 그룹 개수',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({
    example: '인포',
    description: '검색할 그룹 이름(일부)',
    required: true,
  })
  @Max(40)
  @Min(1)
  @IsString()
  query: string;
}
