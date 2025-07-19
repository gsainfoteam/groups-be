import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Permission } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'Name of the role',
  })
  @IsString()
  name: string;

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
