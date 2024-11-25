import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { IdpService } from 'src/idp/idp.service';
import { UserService } from 'src/user/user.service';
import { AccessTokenDto } from './dto/res/accessTokenRes.dto';
import { Loggable } from '@lib/logger/decorator/loggable';

@Injectable()
@Loggable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly idpService: IdpService,
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
