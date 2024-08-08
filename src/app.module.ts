import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { IdpModule } from './idp/idp.module';
import { HealthModule } from './health/health.module';
import { ClientModule } from './client/client.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    IdpModule,
    HealthModule,
    ClientModule,
    AuthModule,
    UserModule,
    GroupModule,
    RoleModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
