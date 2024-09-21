import { ApiProperty } from '@nestjs/swagger';

export class CheckGroupExistenceByNameDto {
  @ApiProperty()
  exist: boolean;
}
