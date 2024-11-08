import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Group, User } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';

export class GroupResDto implements Group {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  presidentUuid: string;

  @ApiProperty()
  verifiedAt: Date | null;

  @ApiProperty()
  notionPageId: string | null;

  @ApiProperty()
  profileImageKey: string | null;

  @ApiProperty()
  profileImageUrl: string | null;

  @ApiProperty()
  @Expose()
  get verified(): boolean {
    return this.verifiedAt !== null;
  }

  @Exclude()
  deletedAt: Date | null;

  constructor(partial: Partial<GroupResDto>) {
    Object.assign(this, partial);
  }
}

export class GroupListResDto {
  @ApiProperty({ type: [GroupResDto] })
  list: GroupResDto[];
}

export class MemberResDto implements User {
  @ApiProperty()
  @Expose()
  uuid: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  email: string;

  @Exclude()
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose()
  role?: string;

  constructor(partial: Partial<MemberResDto>) {
    Object.assign(this, partial);
  }
}

export class MemberListResDto {
  @ApiProperty({ type: [MemberResDto] })
  list: MemberResDto[];
}
