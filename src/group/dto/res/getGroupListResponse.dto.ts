import { ApiProperty } from '@nestjs/swagger';

export class GetGroupListResponseDto {
  @ApiProperty({
    description: 'UUID of the group',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  uuid: string;

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

  @ApiProperty({
    description: 'Date the group was created',
    example: '2021-07-01T00:00:00.000Z',
  })
  createdAt: Date;
}
