import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateExternalTokenDto {
  @ApiProperty()
  @IsString()
  idpToken: string;
}
