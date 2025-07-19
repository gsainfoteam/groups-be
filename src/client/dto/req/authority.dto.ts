import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PermissionDto {
  @ApiProperty({
    description: 'The permission to be added',
  })
  @IsString()
  permission: string;
}
