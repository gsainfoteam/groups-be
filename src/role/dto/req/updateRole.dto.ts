import { ApiPropertyOptional } from '@nestjs/swagger';
import { Permission } from '@prisma/client';
import { IsArray, IsEnum, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: ['ROLE_CREATE'],
    description: 'Permissions for the role',
    enum: Permission,
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions?: Permission[];
}
