import { ApiProperty } from '@nestjs/swagger';
import {
  $Enums,
  ExternalPermission,
  RoleExternalPermission,
} from '@prisma/client';
import { UserRoleInfo } from 'src/third-party/types/userRoleInfo.type';

class ExternalPermissionDto implements ExternalPermission {
  @ApiProperty()
  clientUuid: string;

  @ApiProperty()
  permission: string;
}

class RoleExternalPermissionDto implements RoleExternalPermission {
  @ApiProperty({ type: ExternalPermissionDto })
  ExternalPermission: ExternalPermissionDto;

  @ApiProperty()
  clientUuid: string;

  @ApiProperty()
  permission: string;

  @ApiProperty()
  roleId: number;

  @ApiProperty()
  roleGroupUuid: string;
}

export class UserRoleInfoResDto implements UserRoleInfo {
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
