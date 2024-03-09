import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './user.repository';

@Module({
  imports: [HttpModule, PrismaModule],
  providers: [UserService, UserRepository],
})
export class UserModule {}
