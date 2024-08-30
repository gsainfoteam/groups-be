import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { ExpandedGroup } from 'src/group/types/ExpandedGroup.type';

class PresidentResDto implements User {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;
}

export class ExpandedGroupResDto implements ExpandedGroup {
  @Exclude()
  President: User;

  @Exclude()
  _count: { UserGroup: number };

  @Exclude()
  deletedAt: Date | null;

  @Exclude()
  presidentUuid: string;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: PresidentResDto })
  @Expose()
  get president(): User {
    return this.President;
  }

  @ApiProperty()
  @Expose()
  get memberCount(): number {
    return this._count.UserGroup;
  }

  @ApiProperty()
  verifiedAt: Date | null;

  @ApiProperty()
  @Expose()
  get verified(): boolean {
    return this.verifiedAt !== null;
  }

  @ApiProperty()
  notionPageId: string | null;

  @ApiProperty()
  profileImageKey: string | null;

  constructor(partial: Partial<ExpandedGroup>) {
    Object.assign(this, partial);
  }
}
