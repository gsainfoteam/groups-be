import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  @ApiProperty({
    description: 'Access Token',
    example: 'eyJhbGciOi...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token Type',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Expires In',
    example: 3600,
  })
  expiresIn: number;
}
