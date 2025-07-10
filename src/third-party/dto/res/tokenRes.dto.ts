import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenResDto {
  @ApiProperty({
    name: 'access_token',
  })
  @Expose({
    name: 'access_token',
  })
  accessToken: string;

  @ApiProperty({
    name: 'expires_in',
  })
  @Expose({
    name: 'expires_in',
  })
  expiresIn: number;

  @ApiProperty({
    name: 'token_type',
  })
  @Expose({
    name: 'token_type',
  })
  tokenType: string;
}
