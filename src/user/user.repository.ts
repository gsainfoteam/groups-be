import { Loggable } from '@lib/logger/decorator/loggable';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
@Loggable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserByUuid(uuid: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        uuid,
      },
    });
  }

  async upsertUser({
    uuid,
    name,
    email,
  }: Pick<User, 'uuid' | 'name' | 'email'>): Promise<User> {
    return this.prismaService.user.upsert({
      where: {
        uuid,
      },
      create: {
        uuid,
        name,
        email,
      },
      update: {
        name,
        email,
      },
    });
  }
}
