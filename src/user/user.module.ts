import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './user.repository';
import { LoggerModule } from '@lib/logger';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
