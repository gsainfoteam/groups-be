import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserInfo(uuid: string): Promise<User> {
    const user = await this.userRepository.getUserByUuid(uuid);
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    return user;
  }

  async upsertUser({
    uuid,
    name,
    email,
  }: Pick<User, 'uuid' | 'name' | 'email'>): Promise<User> {
    return this.userRepository.upsertUser({ uuid, name, email });
  }
}
