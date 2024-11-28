import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { AccessTokenDto } from './dto/res/accessTokenRes.dto';
import { Loggable } from '@lib/logger/decorator/loggable';
import { InfoteamIdpService } from '@lib/infoteam-idp';

@Injectable()
@Loggable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly idpService: InfoteamIdpService,
  ) {}

  async login(code: string, redirectUri: string): Promise<AccessTokenDto> {
    const { access_token: accessToken } =
      await this.idpService.getAccessTokenFromIdP(code, redirectUri);
    const { uuid, name, email } =
      await this.idpService.getUserInfo(accessToken);
    await this.userService.upsertUser({ uuid, name, email });
    return { accessToken };
  }

  async validateUser(accessToken: string): Promise<User> {
    const { uuid } = await this.idpService.getUserInfo(accessToken);
    return this.userService.getUserInfo(uuid);
  }
}
