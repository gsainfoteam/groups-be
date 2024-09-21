import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotionService {
  private readonly logger = new Logger(NotionService.name);
  constructor(private readonly httpService: HttpService) {}

  async getRecordMap(pageId: string): Promise<JSON> {
    const response = await firstValueFrom(
      this.httpService.post(
        `https://www.notion.so/api/v3/loadPageChunk`,
        {
          pageId,
          limit: 100,
          cursor: { stack: [] },
          chunkNumber: 0,
          verticalColumns: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    ).catch((error) => {
      this.logger.debug(error);
      throw new InternalServerErrorException();
    });
    return response.data;
  }
}
