import { IsInt, IsString, IsUUID } from 'class-validator';

export class DeleteUserRoleDto {
  @IsString()
  groupName: string;

  @IsUUID()
  deleteUserUuid: string;

  @IsInt()
  roleId: number;
}
