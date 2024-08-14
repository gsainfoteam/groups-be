import { Module } from '@nestjs/common';
import { ClientModule } from 'src/client/client.module';
import { GroupModule } from 'src/group/group.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IdpModule } from 'src/idp/idp.module';
import { UserModule } from 'src/user/user.module';
import { ExternalService } from './external.service';
import { ExternalController } from './external.controller';

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
          subject: configService.getOrThrow<string>('EXTERNAL_JWT_SUBJECT'),
          expiresIn: configService.getOrThrow<string>(
            'EXTERNAL_JWT_EXPIRES_IN',
          ),
        },
      }),
    }),
  ],
  providers: [ExternalService],
  controllers: [ExternalController],
})
export class ExternalModule {}
