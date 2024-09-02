import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AccessTokenDto } from '../dto/res/accessTokenRes.dto';

@Injectable()
export class IdpStrategy extends PassportStrategy(Strategy, 'idp') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      authorizationURL: configService.get('IDP_AUTH_URL'),
      tokenURL: configService.get('IDP_TOKEN_URL'),
      clientID: configService.get('IDP_CLIENT_ID'),
      clientSecret: configService.get('IDP_CLIENT_SECRET'),
      callbackURL: `${configService.get('BASE_URL')}/auth/callback`,
      scope: ['openid', 'email', 'profile'],
    });
  }

  async validate(accessToken: string): Promise<AccessTokenDto> {
    return this.authService.login(accessToken);
  }
}
