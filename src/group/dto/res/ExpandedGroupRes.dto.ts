import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { ExpandedGroup } from 'src/group/types/ExpandedGroup.type';

class CountUserGroupResDto {
  @ApiProperty()
  UserGroup: number;
}

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

  @ApiProperty({ type: PresidentResDto })
  President: PresidentResDto;

  @ApiProperty({ type: CountUserGroupResDto })
  _count: CountUserGroupResDto;
}
