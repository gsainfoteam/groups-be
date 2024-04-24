import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt } from 'class-validator';

export class CreateUserRoleDto {
  @ApiProperty({ description: 'User UUID' })
  @IsUUID()
  createUserUuid: string;

  @ApiProperty({ description: 'Group UUID' })
  groupName: string;

  @ApiProperty({ description: 'Role ID' })
  @IsInt()
  roleId: number;
}
