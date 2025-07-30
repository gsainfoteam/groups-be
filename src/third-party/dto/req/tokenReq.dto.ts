import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokenReqDto {
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
    name: 'code',
    description: 'The authorization code received from the third-party service',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Expose({
    name: 'code',
  })
  code: string;

  @ApiProperty({
    name: 'redirect_uri',
    description: 'The redirect URI used in the authorization request',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Expose({
    name: 'redirect_uri',
  })
  redirectUri: string;
}
