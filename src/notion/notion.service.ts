import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotionService {
  private readonly logger = new Logger(NotionService.name);
  constructor(private readonly httpService: HttpService) {}

  async getRecordMap(pageId: string): Promise<JSON> {
    const response = await firstValueFrom(
      this.httpService.get(`https://notion-api.splitbee.io/v1/page/${pageId}`),
    ).catch((error) => {
      if (error instanceof AxiosError) {
        this.logger.debug(error.response?.data);
        if (error.response?.status === 400) {
          throw new BadRequestException(error.response?.data);
        }
        throw new InternalServerErrorException();
      }
      this.logger.debug(error);
      throw new InternalServerErrorException();
    });
    return response.data;
  }
}
