import { ApiProperty } from '@nestjs/swagger';
import { Authority, Role, RoleExternalAuthority } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
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

  @ApiProperty()
  @Expose()
  get externalAuthority(): string[] {
    return this.RoleExternalAuthority.map(
      (roleExternalAuthority) => roleExternalAuthority.authority,
    );
  }

  @Exclude()
  RoleExternalAuthority: RoleExternalAuthorityResDto[];

  constructor(partial: Partial<Role>) {
    Object.assign(this, partial);
  }
}

export class GroupWithRoleResDto implements GroupWithRole {
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

  @ApiProperty()
  verifiedAt: Date | null;

  @ApiProperty({ type: RoleResDto, isArray: true })
  Role: RoleResDto[];

  @ApiProperty()
  notionPageId: string | null;

  @ApiProperty()
  profileImageKey: string | null;

  @Exclude()
  deletedAt: Date | null;

  constructor(partial: Partial<GroupWithRole>) {
    Object.assign(this, partial);
  }
}

export class ExternalInfoResDto {
  @ApiProperty({ type: GroupWithRoleResDto, isArray: true })
  list: GroupWithRoleResDto[];
}
