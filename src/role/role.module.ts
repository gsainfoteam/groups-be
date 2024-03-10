import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { RoleRepository } from './role.repository';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
})
export class RoleModule {}
