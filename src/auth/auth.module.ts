import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IdpStrategy } from './strategy/idp.strategy';
import { ConfigModule } from '@nestjs/config';
import { IdpModule } from 'src/idp/idp.module';
import { IdPGuard } from './guard/idp.guard';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [ConfigModule, IdpModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, IdpStrategy, IdPGuard],
})
export class AuthModule {}
