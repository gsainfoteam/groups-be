import { ApiProperty } from '@nestjs/swagger';
import { ViewAs } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserGroupViewAsDto {
  @ApiProperty({
    example: 'Public',
    description: '"view as" status of user in certain group',
    type: 'enum',
    enum: ViewAs,
  })
  @IsEnum(ViewAs)
  viewAs: ViewAs;
}
