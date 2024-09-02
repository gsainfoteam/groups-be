import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserResDto implements User {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;
}
