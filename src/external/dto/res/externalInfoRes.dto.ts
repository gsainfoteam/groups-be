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

class RoleWithExternalResDto implements Role {
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

  @ApiProperty({
    type: String,
    isArray: true,
  })
  @Expose()
  get externalAuthority(): string[] {
    return this.RoleExternalAuthority.map(
      (roleExternalAuthority) => roleExternalAuthority.authority,
    );
  }

  @Exclude()
  RoleExternalAuthority: RoleExternalAuthorityResDto[];

  constructor(partial: Partial<RoleWithExternalResDto>) {
    Object.assign(this, partial);
  }
}

export class GroupWithRoleResDto implements GroupWithRole {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    type: String,
  })
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  presidentUuid: string;

  @ApiProperty({
    type: Date,
  })
  verifiedAt: Date | null;

  @ApiProperty({
    type: String,
  })
  notionPageId: string | null;

  @ApiProperty({
    type: String,
  })
  profileImageKey: string | null;

  @ApiProperty()
  profileImageUrl: string | null;

  @ApiProperty({
    type: RoleWithExternalResDto,
    isArray: true,
  })
  @Expose()
  get role(): RoleWithExternalResDto[] {
    return this.Role.map((role) => new RoleWithExternalResDto(role));
  }

  @Exclude()
  deletedAt: Date | null;

  @Exclude()
  Role: RoleWithExternalResDto[];

  constructor(partial: Partial<GroupWithRole>) {
    Object.assign(this, partial);
  }
}

export class ExternalInfoResDto {
  @ApiProperty({ type: GroupWithRoleResDto, isArray: true })
  list: GroupWithRoleResDto[];
}
