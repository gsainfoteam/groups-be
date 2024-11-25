import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { IdpModule } from 'src/idp/idp.module';
import { UserModule } from 'src/user/user.module';
import { GroupsGuard } from './guard/groups.guard';
import { GroupsStrategy } from './strategy/groups.strategy';
import { LoggerModule } from '@lib/logger';

@Module({
  imports: [ConfigModule, IdpModule, UserModule, LoggerModule],
  controllers: [AuthController],
  providers: [AuthService, GroupsGuard, GroupsStrategy],
  exports: [GroupsGuard, GroupsStrategy],
})
export class AuthModule {}
