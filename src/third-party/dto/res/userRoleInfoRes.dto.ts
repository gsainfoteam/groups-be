import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Role, RoleExternalPermission } from '@prisma/client';
import { UserGroupInfo } from 'src/third-party/types/userGroupInfo.type';

class RoleExternalPermissionDto implements RoleExternalPermission {
  @ApiProperty()
  clientUuid: string;

  @ApiProperty()
  permission: string;

  @ApiProperty()
  roleId: number;

  @ApiProperty()
  roleGroupUuid: string;
}

class RoleDto implements Role {
  @ApiProperty({ type: [RoleExternalPermissionDto] })
  RoleExternalPermission: RoleExternalPermissionDto[];

  @ApiProperty()
  name: string;

  @ApiProperty()
  id: number;

  @ApiProperty()
  groupUuid: string;

  @ApiProperty({ enum: $Enums.Permission, isArray: true })
  permissions: $Enums.Permission[];
}
export class UserGroupInfoResDto implements UserGroupInfo {
  @ApiProperty({ type: [RoleDto] })
  Role: RoleDto[];

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  verifiedAt: Date | null;

  @ApiProperty()
  presidentUuid: string;

  @ApiProperty()
  deletedAt: Date | null;

  @ApiProperty()
  notionPageId: string | null;

  @ApiProperty()
  profileImageKey: string | null;
}
