import { ApiProperty } from '@nestjs/swagger';
import { Group } from '@prisma/client';
import { Exclude } from 'class-transformer';

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
}
