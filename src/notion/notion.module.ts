import { Module } from '@nestjs/common';
import { NotionController } from './notion.controller';
import { NotionService } from './notion.service';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { LoggerModule } from '@lib/logger';

@Module({
  imports: [HttpModule, AuthModule, LoggerModule],
  controllers: [NotionController],
  providers: [NotionService],
})
export class NotionModule {}
