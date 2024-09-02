import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthorityDto {
  @ApiProperty({
    description: 'The authority to be added',
  })
  @IsString()
  authority: string;
}
