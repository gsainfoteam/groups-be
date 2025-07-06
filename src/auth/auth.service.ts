import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Loggable } from '@lib/logger/decorator/loggable';
import { InfoteamIdpService } from '@lib/infoteam-idp';
import { User } from '@prisma/client';

@Injectable()
@Loggable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly idpService: InfoteamIdpService,
  ) {}
  async login(token: string): Promise<void> {
    const { uuid, name, email } =
      await this.idpService.validateAccessToken(token);
    await this.userService.upsertUser({ uuid, name, email });
  }

  async validateUser(accessToken: string): Promise<User> {
    const userInfo = await this.idpService.validateAccessToken(accessToken);
    if (!userInfo) {
      throw new UnauthorizedException('Invalid access token');
    }
    return this.userService.getUserInfo(userInfo.uuid);
  }
}
