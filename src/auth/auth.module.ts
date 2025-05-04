import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GroupsGuard } from './guard/groups.guard';
import { GroupsStrategy } from './strategy/groups.strategy';
import { LoggerModule } from '@lib/logger';
import { InfoteamIdpModule } from '@lib/infoteam-idp';
import { PrismaModule } from '@lib/prisma';
import { JwtModule } from '@nestjs/jwt';
import { IdpIdTokenStrategy } from './strategy/idpIdtoken.strategy';
import { IdpIdtokenGuard } from './guard/idpIdtoken.guard';
import { AuthRepository } from './auth.repository';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN'),
          audience: configService.get<string>('JWT_AUDIENCE'),
          issuer: configService.get<string>('JWT_ISSUER'),
          algorithm: 'HS256',
        },
      }),
    }),
    InfoteamIdpModule,
    PrismaModule,
    LoggerModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    GroupsGuard,
    GroupsStrategy,
    IdpIdTokenStrategy,
    IdpIdtokenGuard,
  ],
  exports: [GroupsGuard, GroupsStrategy],
})
export class AuthModule {}
