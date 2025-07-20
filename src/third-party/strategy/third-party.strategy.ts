import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class ThirdPartyStrategy extends PassportStrategy(
  Strategy,
  'third-party',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.THIRD_PARTY_JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<any> {
    // Here you can add additional validation logic if needed
    return { userUuid: payload.sub, clientUuid: payload.aud };
  }
}
