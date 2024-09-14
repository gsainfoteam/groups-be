import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeSuperAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newSuperAdminUuid: string;
}
