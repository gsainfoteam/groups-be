import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { GroupModule } from './group/group.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { IdpModule } from './idp/idp.module';
import { HealthModule } from './health/health.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    GroupModule,
    UserModule,
    RoleModule,
    IdpModule,
    HealthModule,
    ClientModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
