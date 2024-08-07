import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Group } from '@prisma/client';

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
}

export class GroupListResDto {
  @ApiProperty({ type: [GroupResDto] })
  list: GroupResDto[];
}
