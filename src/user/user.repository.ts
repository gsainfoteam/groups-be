import { Loggable } from '@lib/logger/decorator/loggable';
import { PrismaService } from '@lib/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
@Loggable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  async getUserByUuid(uuid: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        uuid,
      },
    });
    if (!user) {
      this.logger.warn(`user not found`);
    }
    return user;
  }

  async upsertUser({ uuid, name, email }: Pick<User, 'uuid' | 'name' | 'email'>): Promise<User> {
    this.logger.log(`upserting user: ${name}`);

    return this.prismaService.user.upsert({
      where: { uuid },
      create: { uuid, name, email },
      update: { name, email },
    })
    .then(user => {
      this.logger.log(`successfully upserted user: ${name}`);
      return user;
    })
    .catch(error => {
      this.logger.error(`failed to upsert user: ${name}`);
      throw error;
    });
  }
}
