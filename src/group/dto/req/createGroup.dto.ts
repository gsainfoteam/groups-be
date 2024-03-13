import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Name of the group',
    example: 'Infoteam',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the group',
    example: 'Infoteam is...',
  })
  description?: string;
}
