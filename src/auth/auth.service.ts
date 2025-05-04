import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Loggable } from '@lib/logger/decorator/loggable';
import { InfoteamIdpService } from '@lib/infoteam-idp';
import { AccessTokenDto } from './dto/res.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';

@Injectable()
@Loggable()
export class AuthService {
  private readonly jwtExpiresIn: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly idpService: InfoteamIdpService,
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
  ) {
    this.jwtExpiresIn = ms(
      this.configService.getOrThrow<string>('JWT_EXPIRES_IN') as StringValue,
    );
  }

  async login(userUuid: string): Promise<AccessTokenDto> {
    const user = await this.authRepository.upsertUser(userUuid);
    const accessToken = this.jwtService.sign({
      sub: user.uuid,
    });
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.jwtExpiresIn,
    };
  }

  async findUserByUuid(uuid: string): Promise<User | null> {
    return this.authRepository.findUserByUuid(uuid);
  }
}
