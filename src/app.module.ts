import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { ClientModule } from './client/client.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { RoleModule } from './role/role.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ExternalModule } from './external/external.module';
import { NotionModule } from './notion/notion.module';

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
    HealthModule,
    ClientModule,
    AuthModule,
    UserModule,
    GroupModule,
    RoleModule,
    ExternalModule,
    NotionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
