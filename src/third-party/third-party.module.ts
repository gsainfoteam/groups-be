import { Module } from '@nestjs/common';
import { ThirdPartyController } from './third-party.controller';
import { ThirdPartyService } from './third-party.service';
import { ThirdPartyRepository } from './third-party.repository';

@Module({
  imports: [],
  controllers: [ThirdPartyController],
  providers: [ThirdPartyService, ThirdPartyRepository],
})
export class ThirdPartyModule {}
