import { Module } from '@nestjs/common';
import { InfoteamIdpService } from './infoteam-idp.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [HttpModule, ConfigModule, JwtModule],
  providers: [InfoteamIdpService],
  exports: [InfoteamIdpService],
})
export class InfoteamIdpModule {}
