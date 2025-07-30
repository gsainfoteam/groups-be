import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthorizeReqDto {
  @ApiProperty({
    name: 'client_id',
    description: 'The client ID',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Expose({
    name: 'client_id',
  })
  clientId: string;

  @ApiProperty({
    name: 'redirect_uri',
    description: 'The redirect URI',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Expose({
    name: 'redirect_uri',
  })
  redirectUri: string;
}
