import { PrismaService } from '@lib/prisma';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserByUuid(uuid: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { uuid },
    });
  }

  async upsertUser(uuid: string): Promise<User> {
    return this.prismaService.user.upsert({
      where: { uuid },
      update: {},
      create: {
        uuid,
      },
    });
  }
}
