import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Loggable } from '@lib/logger/decorator/loggable';
import { InfoteamIdpService } from '@lib/infoteam-idp';

@Injectable()
@Loggable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly idpService: InfoteamIdpService,
  ) {}
}
