import { IsString } from 'class-validator';

export class CreateCertTokenDto {
  @IsString()
  idpToken: string;
}
