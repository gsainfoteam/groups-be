import { ApiProperty } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserVisibilityInGroupDto {
  @ApiProperty({
    example: 'Public',
    description: '"visibility" status of user in certain group',
    type: 'enum',
    enum: Visibility,
  })
  @IsEnum(Visibility)
  visibility: Visibility;
}
