import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { LoggerModule } from '@lib/logger';
import { PrismaModule } from '@lib/prisma';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
