import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { IdpService } from 'src/idp/idp.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly idpService: IdpService,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * this function validates the user by idp and creates the user if not found
   * @param accessToken the access token from idp
   * @returns User type
   */
  async validateUser(accessToken: string): Promise<User> {
    this.logger.log('Validating user');
    const userInfo = await this.idpService.getUserInfo(accessToken);
    const user = await this.userRepository.getUserByUuid({
      uuid: userInfo.userUuid,
    });
    if (!user) {
      this.logger.log('User not found, creating user');
      return this.userRepository.createUser({ uuid: userInfo.userUuid });
    }
    return user;
  }
}
