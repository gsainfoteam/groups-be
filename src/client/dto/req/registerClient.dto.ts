import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterClientDto {
  @ApiProperty({
    description: 'The name of the client. it must be unique',
  })
  @IsString()
  name: string;
}
