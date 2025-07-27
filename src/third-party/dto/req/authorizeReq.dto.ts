import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthorizeReqDto {
  @IsNotEmpty()
  @IsString()
  @Expose({
    name: 'client_id',
  })
  clientId: string;

  @IsNotEmpty()
  @IsString()
  @Expose({
    name: 'redirect_uri',
  })
  redirectUri: string;
}
