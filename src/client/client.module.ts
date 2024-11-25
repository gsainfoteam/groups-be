import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ClientRepository } from './client.repository';
import { ClientStrategy } from './strategy/client.strategy';
import { ClientGuard } from './guard/client.guard';
import { LoggerModule } from '@lib/logger';

@Module({
  imports: [PrismaModule, HttpModule, ConfigModule, LoggerModule],
  controllers: [ClientController],
  providers: [ClientService, ClientRepository, ClientStrategy, ClientGuard],
  exports: [ClientGuard],
})
export class ClientModule {}
