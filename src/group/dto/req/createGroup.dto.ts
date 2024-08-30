import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  notionPageId?: string;
}
