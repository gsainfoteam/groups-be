import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { ExpandedGroup } from 'src/group/types/ExpandedGroup.type';

export class InvitationInfoResDto implements ExpandedGroup {
  @Exclude()
  President: User;

  @Exclude()
  _count: { UserGroup: number };

  @Exclude()
  uuid: string;

  @Exclude()
  description: string | null;

  @Exclude()
  createdAt: Date;

  @Exclude()
  verifiedAt: Date | null;

  @Exclude()
  presidentUuid: string;

  @Exclude()
  deletedAt: Date | null;

  @Exclude()
  notionPageId: string | null;

  @Exclude()
  profileImageKey: string | null;

  @ApiProperty()
  @Expose()
  get presidentEmail(): string {
    return this.President.email;
  }

  @ApiProperty()
  name: string;

  constructor(partial: Partial<InvitationInfoResDto>) {
    Object.assign(this, partial);
  }
}
