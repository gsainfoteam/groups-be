import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { GroupModule } from './group/group.module';
import { MemberModule } from './member/member.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { IdpModule } from './idp/idp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    GroupModule,
    MemberModule,
    UserModule,
    RoleModule,
    IdpModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
