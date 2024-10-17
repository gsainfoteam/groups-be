import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Group, User } from '@prisma/client';
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
  @Expose()
  get verified(): boolean {
    return this.verifiedAt !== null;
  }

  @ApiProperty({
    type: String,
  })
  @Expose()
  get profileImageUrl(): string | null {
    return this.profileImageKey
      ? `${this.s3Url}/${this.profileImageKey}`
      : null;
  }

  @Exclude()
  s3Url: string;

  @Exclude()
  deletedAt: Date | null;

  constructor(partial: Partial<GroupResDto> & { s3Url: string }) {
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

  @Exclude()
  email: string;

  @Exclude()
  createdAt: Date;

  constructor(partial: Partial<MemberResDto>) {
    Object.assign(this, partial);
  }
}

export class MemberListResDto {
  @ApiProperty({ type: [MemberResDto] })
  list: MemberResDto[];
}
