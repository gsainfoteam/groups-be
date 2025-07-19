import { ApiProperty } from '@nestjs/swagger';
import { ClientResDto } from './clientRes.dto';
import { ExternalPermission } from '@prisma/client';

class PermissionResDto implements ExternalPermission {
  @ApiProperty()
  clientUuid: string;

  @ApiProperty()
  permission: string;
}

export class ExpandedClientResDto extends ClientResDto {
  @ApiProperty()
  ExternalPermission: PermissionResDto[];
}
