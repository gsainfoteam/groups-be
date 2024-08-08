import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { RedisHealthModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [PrismaModule, TerminusModule, ConfigModule, RedisHealthModule],
  controllers: [HealthController],
})
export class HealthModule {}
