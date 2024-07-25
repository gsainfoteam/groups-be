import { ApiProperty } from '@nestjs/swagger';
import { Authority, Role } from '@prisma/client';

export class GetRoleResDto implements Role {
  @ApiProperty({
    description: 'Unique identifier of the role',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the role',
    example: 'Admin',
  })
  name: string;

  @ApiProperty({
    description: 'Group UUID',
    example: '1',
  })
  groupUuid: string;

  @ApiProperty({
    description: 'List of authorities',
    example: ['ROLE_CREATE'],
  })
  authorities: Authority[];

  @ApiProperty({
    description: 'List of external authorities',
    example: ['ZIGGLE_NOTICE_CREATE'],
  })
  externalAuthorities: string[];
}

export class GetRoleListResDto {
  @ApiProperty({
    description: 'List of roles',
    type: [GetRoleResDto],
  })
  list: GetRoleResDto[];
}
