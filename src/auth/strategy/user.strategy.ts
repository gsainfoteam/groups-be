import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class UserStrategy extends PassportStrategy(Strategy, 'user:jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken,
      issuer: configService.getOrThrow<string>('JWT_ISSUER'),
      audience: configService.getOrThrow<string>('JWT_AUDIENCE'),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate({ sub }: JwtPayload): Promise<User> {
    if (!sub) {
      throw new UnauthorizedException('Invalid token');
    }
    const user = await this.authService.findUserByUuid(sub);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
