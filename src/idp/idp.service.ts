import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserInfoResponse } from './types/userInfo.type';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class IdpService {
  private readonly logger = new Logger(IdpService.name);
  private idpUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.idpUrl = this.configService.getOrThrow<string>('IDP_URL');
  }

  /**
   * Get user info from IDP and the handing exceptions
   * @param accessToken it is the idp access token
   * @returns object of the UserInfo type
   */
  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    this.logger.log('Fetching user info from IDP');
    const url = this.idpUrl + '/userinfo';
    const userInfoResponse = await firstValueFrom(
      this.httpService
        .get<UserInfoResponse>(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((error) => {
            if (error instanceof AxiosError) {
              if (error.response?.status === 401) {
                this.logger.debug('Invalid access token');
                throw new UnauthorizedException('Invalid access token');
              }
              this.logger.error('IDP error', error);
              throw new InternalServerErrorException('IDP error');
            }
            this.logger.error('Unknown error', error);
            throw new InternalServerErrorException('Unknown error');
          }),
        ),
    );
    return userInfoResponse.data;
  }
}
