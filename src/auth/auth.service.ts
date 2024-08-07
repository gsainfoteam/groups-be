import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { IdpService } from 'src/idp/idp.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly idpService: IdpService,
  ) {}

  async login(accessToken: string): Promise<{ accessToken: string }> {
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
