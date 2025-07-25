import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { LoggerModule } from '@lib/logger';
import { InfoteamIdpModule } from '@lib/infoteam-idp';
import { UserGuard } from './guard/user.guard';
import { UserStrategy } from './strategy/user.strategy';

@Module({
  imports: [ConfigModule, InfoteamIdpModule, UserModule, LoggerModule],
  controllers: [AuthController],
  providers: [AuthService, UserGuard, UserStrategy],
  exports: [UserGuard, UserStrategy],
})
export class AuthModule {}
