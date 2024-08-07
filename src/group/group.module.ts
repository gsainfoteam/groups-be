import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [PrismaModule, AuthModule, RedisModule],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
