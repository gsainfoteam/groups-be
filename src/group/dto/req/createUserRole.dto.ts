import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt } from 'class-validator';

export class CreateUserRoleDto {
  @ApiProperty({ description: 'User UUID' })
  @IsUUID()
  user_uuid: string;

  @ApiProperty({ description: 'Group UUID' })
  @IsUUID()
  group_uuid: string;

  @ApiProperty({ description: 'Role ID' })
  @IsInt()
  role_id: number;
}
