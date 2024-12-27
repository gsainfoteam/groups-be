import { ApiProperty } from '@nestjs/swagger';
import { ClientResDto } from './clientRes.dto';
import { ExternalAuthority } from '@prisma/client';

class AuthorityResDto implements ExternalAuthority {
  @ApiProperty()
  clientUuid: string;

  @ApiProperty()
  authority: string;
}

export class ExpandedClientResDto extends ClientResDto {
  @ApiProperty()
  ExternalAuthority: AuthorityResDto[];
}
