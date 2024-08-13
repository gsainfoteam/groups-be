import { ApiProperty } from '@nestjs/swagger';
import { Authority, Role, RoleExternalAuthority } from '@prisma/client';
import { GroupWithRole } from 'src/group/types/groupWithRole';

class RoleExternalAuthorityResDto implements RoleExternalAuthority {
  @ApiProperty()
  roleId: number;

  @ApiProperty()
  roleGroupUuid: string;

  @ApiProperty()
  clientUuid: string;

  @ApiProperty()
  authority: string;
}

class RoleResDto implements Role {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  groupUuid: string;

  @ApiProperty({
    enum: Authority,
  })
  authorities: Authority[];

  @ApiProperty({ type: RoleExternalAuthorityResDto, isArray: true })
  RoleExternalAuthority: RoleExternalAuthorityResDto[];
}

class GroupWithRoleResDto implements GroupWithRole {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  presidentUuid: string;

  @ApiProperty({ type: RoleResDto, isArray: true })
  Role: RoleResDto[];
}

export class CertInfoResDto {
  list: GroupWithRoleResDto[];
}
