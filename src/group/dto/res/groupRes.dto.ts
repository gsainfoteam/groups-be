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
