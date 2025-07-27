import { Module } from '@nestjs/common';
import { ThirdPartyController } from './third-party.controller';
import { ThirdPartyService } from './third-party.service';
import { ThirdPartyRepository } from './third-party.repository';
import { PrismaModule } from '@lib/prisma';
import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThirdPartyStrategy } from './strategy/third-party.strategy';
import { ThirdPartyGuard } from './guard/third-party.guard';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RedisModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('THIRD_PARTY_JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('THIRD_PARTY_JWT_EXPIRES_IN'),
          issuer: configService.get<string>('THIRD_PARTY_JWT_ISSUER'),
        },
      }),
    }),
  ],
  controllers: [ThirdPartyController],
  providers: [
    ThirdPartyService,
    ThirdPartyRepository,
    ThirdPartyStrategy,
    ThirdPartyGuard,
  ],
})
export class ThirdPartyModule {}
