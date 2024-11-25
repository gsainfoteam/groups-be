import { Module } from '@nestjs/common';
import { ClientModule } from 'src/client/client.module';
import { GroupModule } from 'src/group/group.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IdpModule } from 'src/idp/idp.module';
import { UserModule } from 'src/user/user.module';
import { ExternalService } from './external.service';
import { ExternalController } from './external.controller';
import { ExternalGuard } from './guard/external.guard';
import { ExternalStrategy } from './strategy/external.strategy';
import { LoggerModule } from '@lib/logger';

@Module({
  imports: [
    ConfigModule,
    ClientModule,
    GroupModule,
    IdpModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('EXTERNAL_JWT_SECRET'),
        signOptions: {
          issuer: configService.getOrThrow<string>('EXTERNAL_JWT_ISSUER'),
          expiresIn: configService.getOrThrow<string>(
            'EXTERNAL_JWT_EXPIRES_IN',
          ),
        },
      }),
    }),
    LoggerModule,
  ],
  providers: [ExternalService, ExternalGuard, ExternalStrategy],
  controllers: [ExternalController],
})
export class ExternalModule {}
