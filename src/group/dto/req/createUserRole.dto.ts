import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsString } from 'class-validator';

export class CreateUserRoleDto {
  @ApiProperty({ description: 'User UUID' })
  @IsUUID()
  createUserUuid: string;

  @ApiProperty({ description: 'Group UUID' })
  @IsString()
  groupName: string;

  @ApiProperty({ description: 'Role ID' })
  @IsInt()
  roleId: number;
}
