import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RoleRepository } from './role.repository';
import { AuthModule } from 'src/auth/auth.module';
import { LoggerModule } from '@lib/logger';

@Module({
  imports: [PrismaModule, AuthModule, LoggerModule],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
})
export class RoleModule {}
