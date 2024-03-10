import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './user.repository';
import { IdpModule } from 'src/idp/idp.module';
import { UserStrategy } from './guard/user.strategy';
import { UserGuard } from './guard/user.guard';

@Module({
  imports: [PrismaModule, IdpModule],
  providers: [UserService, UserRepository, UserStrategy, UserGuard],
  exports: [UserService, UserGuard],
})
export class UserModule {}
