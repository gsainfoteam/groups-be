import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class ThirdPartyStrategy extends PassportStrategy(
  Strategy,
  'third-party',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('THIRD_PARTY_JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; aud: string }): Promise<{
    userUuid: string;
    clientUuid: string;
  }> {
    // Here you can add additional validation logic if needed
    return { userUuid: payload.sub, clientUuid: payload.aud };
  }
}
