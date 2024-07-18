import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, TerminusModule, ConfigModule],
  controllers: [HealthController],
})
export class HealthModule {}
