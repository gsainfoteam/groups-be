import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { ExternalPayload } from '../types/certPayload';

@Injectable()
export class ExternalStrategy extends PassportStrategy(Strategy, 'external') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('EXTERNAL_JWT_SECRET'),
    });
  }

  async validate({ sub, aud, iss }: ExternalPayload): Promise<ExternalPayload> {
    const user = await this.userService.getUserInfo(sub);
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    return { sub, aud, iss };
  }
}
