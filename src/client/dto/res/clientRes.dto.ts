import { ApiProperty } from '@nestjs/swagger';
import { Client, Grant } from '@prisma/client';

export class ClientResDto implements Client {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  redirectUri: string[];

  @ApiProperty({
    enum: Grant,
  })
  grant: Grant;
}
