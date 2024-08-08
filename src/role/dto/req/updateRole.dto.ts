import { ApiPropertyOptional } from '@nestjs/swagger';
import { Authority } from '@prisma/client';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: ['ROLE_CREATE'],
    description: 'Authorities for the role',
    enum: Authority,
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsEnum(Authority, { each: true })
  @IsOptional()
  authorities?: Authority[];
}
