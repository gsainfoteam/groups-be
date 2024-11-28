import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';
import { AuthModule } from 'src/auth/auth.module';
import { LoggerModule } from '@lib/logger';
import { PrismaModule } from '@lib/prisma';

@Module({
  imports: [PrismaModule, AuthModule, LoggerModule],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
})
export class RoleModule {}
