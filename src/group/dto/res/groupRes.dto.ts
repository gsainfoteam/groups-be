import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Group } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

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

export class MemberResDto {
  @ApiProperty()
  @Expose()
  uuid: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  email: string | null;

  @Exclude()
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose()
  role: string | null;

  constructor(partial: Partial<MemberResDto>) {
    Object.assign(this, partial);
  }
}

export class MemberListResDto {
  @ApiProperty({ type: [MemberResDto] })
  list: MemberResDto[];
}
