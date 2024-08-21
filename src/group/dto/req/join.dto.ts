import { ApiProperty } from '@nestjs/swagger';

export class JoinDto {
  @ApiProperty()
  code: string;
}
