import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(readonly configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  /**
   * This method is called when the application is on the bootstrap phase.
   * And it's the right place to connect to the database.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * This method is called when the application is shutting down.
   * And it's the right place to close the database connection.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
