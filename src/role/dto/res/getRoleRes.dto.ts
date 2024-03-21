import { ApiProperty } from '@nestjs/swagger';
import { Authoity, Role } from '@prisma/client';

export class GetRoleResDto implements Omit<Role, 'groupName'> {
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
    description: 'List of authorities',
    example: ['ROLE_CREATE'],
  })
  authoities: Authoity[];

  @ApiProperty({
    description: 'List of external authorities',
    example: ['ZIGGLE_NOTICE_CREATE'],
  })
  externalAuthoities: string[];
}

export class GetRoleListResDto {
  @ApiProperty({
    description: 'List of roles',
    type: [GetRoleResDto],
  })
  list: GetRoleResDto[];
}
