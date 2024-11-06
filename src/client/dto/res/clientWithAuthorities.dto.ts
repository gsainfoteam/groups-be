import { ApiProperty } from '@nestjs/swagger';
import { ClientResDto } from './clientRes.dto';

export class ClientWithAuthoritiesDto extends ClientResDto {
  @ApiProperty({ type: [String] })
  authorities: string[];
}