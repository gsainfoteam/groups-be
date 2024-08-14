import { IsString } from 'class-validator';

export class CreateExternalTokenDto {
  @IsString()
  idpToken: string;
}
