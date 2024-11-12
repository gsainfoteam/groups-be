import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ClientResDto } from './clientRes.dto';

export class ClientWithAuthoritiesDto extends ClientResDto {
  @ApiProperty({ type: [String] })
  @Expose()
  authorities: string[];
}