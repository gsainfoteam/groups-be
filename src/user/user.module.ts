import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from './user.repository';
import { IdpModule } from 'src/idp/idp.module';

@Module({
  imports: [PrismaModule, IdpModule],
  providers: [UserService, UserRepository],
})
export class UserModule {}
