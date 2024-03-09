import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userRepository: UserRepository,
  ) {}
}
