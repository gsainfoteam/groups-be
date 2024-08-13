import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IdpModule } from './idp/idp.module';
import { HealthModule } from './health/health.module';
import { ClientModule } from './client/client.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { RoleModule } from './role/role.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CertModule } from './cert/cert.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.getOrThrow<string>('REDIS_URL'),
      }),
    }),
    IdpModule,
    HealthModule,
    ClientModule,
    AuthModule,
    UserModule,
    GroupModule,
    RoleModule,
    CertModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
