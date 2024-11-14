import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisIndicator } from './indicator/redis.indicator';

@Module({
  imports: [
    PrismaModule,
    TerminusModule.forRoot({ errorLogStyle: 'pretty', logger: true }),
    ConfigModule,
    RedisModule,
  ],
  providers: [RedisIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
