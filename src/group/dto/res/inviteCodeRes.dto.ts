import { ApiProperty } from '@nestjs/swagger';

export class InviteCodeResDto {
  @ApiProperty()
  code: string;
}
