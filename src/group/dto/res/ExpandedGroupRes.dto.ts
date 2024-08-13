import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpandedGroup } from 'src/group/types/ExpandedGroup.type';

class CountUserGroupResDto {
  @ApiProperty()
  UserGroup: number;
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

  @ApiProperty({ type: CountUserGroupResDto })
  _count: CountUserGroupResDto;
}
