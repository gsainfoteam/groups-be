import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginQueryDto {
  @ApiProperty({
    description: 'code',
    example: 'code',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'redirectUri',
    example: 'redirectUri',
  })
  @IsString()
  @IsNotEmpty()
  redirectUri: string;
}
