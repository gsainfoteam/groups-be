import { ApiProperty } from '@nestjs/swagger';
import { Group } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class GroupCreateResDto implements Group {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  @Exclude()
  verifiedAt: Date | null;

  @ApiProperty()
  presidentUuid: string;

  @ApiProperty()
  @Exclude()
  deletedAt: Date | null;

  @ApiProperty()
  notionPageId: string | null;

  @ApiProperty()
  profileImageKey: string | null;

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

  constructor(partial: Partial<Group> & { s3Url: string }) {
    Object.assign(this, partial);
  }
}
