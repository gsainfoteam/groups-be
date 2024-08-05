import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteClientDto {
  @ApiProperty({
    description: 'The password of the client',
  })
  @IsString()
  password: string;
}
