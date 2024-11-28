import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { GroupRepository } from './group.repository';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@lib/logger';
import { PrismaModule } from '@lib/prisma';
import { FileModule } from '@lib/file';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    UserModule,
    RedisModule,
    FileModule,
    LoggerModule,
  ],
  providers: [GroupService, GroupRepository],
  controllers: [GroupController],
  exports: [GroupService],
})
export class GroupModule {}
