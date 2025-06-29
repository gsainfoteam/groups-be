import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginQueryDto {
  @ApiProperty({
    description: 'token',
    example: 'token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
