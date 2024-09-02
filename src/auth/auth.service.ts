import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { IdpService } from 'src/idp/idp.service';
import { UserService } from 'src/user/user.service';
import { AccessTokenDto } from './dto/res/accessTokenRes.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly idpService: IdpService,
  ) {}

  async login(accessToken: string): Promise<AccessTokenDto> {
    this.logger.log('Login with IDP');
    const { uuid, name, email } =
      await this.idpService.getUserInfo(accessToken);
    await this.userService.upsertUser({ uuid, name, email });
    return { accessToken };
  }

  async validateUser(accessToken: string): Promise<User> {
    this.logger.log('Validate user');
    const { uuid } = await this.idpService.getUserInfo(accessToken);
    return this.userService.getUserInfo(uuid);
  }
}
