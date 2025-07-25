import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UpdateClientDto {
  @ApiProperty({
    description: 'The redirect URI for the client',
    type: [String],
  })
  @IsUrl(
    {
      require_valid_protocol: false,
      require_tld: false,
      require_protocol: true,
    },
    { each: true },
  )
  redirectUri: string[];
}
