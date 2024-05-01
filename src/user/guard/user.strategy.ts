import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { UserService } from '../user.service';
import { User } from '@prisma/client';

@Injectable()
export class UserStrategy extends PassportStrategy(Strategy, 'user') {
  constructor(private readonly userService: UserService) {
    super();
  }

  /**
   * this function validates the user by token
   * @param token the token from the request
   * @returns User type, it will be contained to the request object
   */
  async validate(token: string): Promise<User> {
    return this.userService.validateUser(token);
  }
}
