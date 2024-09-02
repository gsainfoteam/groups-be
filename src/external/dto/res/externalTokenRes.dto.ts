import { ApiProperty } from '@nestjs/swagger';

export class ExternalTokenResDto {
  @ApiProperty()
  token: string;
}
