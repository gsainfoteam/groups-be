import { Module } from '@nestjs/common';
import { IdpService } from './idp.service';
import { HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpService, ConfigModule],
  providers: [IdpService],
  exports: [IdpService],
})
export class IdpModule {}
