import { InfoteamIdpService, UserInfo } from '@lib/infoteam-idp';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

@Injectable()
export class IdpIdTokenStrategy extends PassportStrategy(
  Strategy,
  'idp:idtoken',
) {
  constructor(private readonly infoteamIdpService: InfoteamIdpService) {
    super();
  }

  async validate(token: string): Promise<UserInfo> {
    return this.infoteamIdpService.decodeIdToken(token);
  }
}
