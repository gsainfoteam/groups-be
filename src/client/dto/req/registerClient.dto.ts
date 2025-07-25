import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class RegisterClientDto {
  @ApiProperty({
    description: 'The name of the client. it must be unique',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'The redirect URI for the client',
    type: [String],
  })
  @IsOptional()
  @IsUrl(
    {
      require_valid_protocol: false,
      require_tld: false,
      require_protocol: true,
    },
    { each: true },
  )
  redirectUri?: string[];
}
