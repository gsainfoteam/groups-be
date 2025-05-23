import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IdpJwtResponse, IdpUserInfoRes } from './types/idp.type';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { UserInfo } from './types/userInfo.type';

/**
 * This is the helper Class for infoteam idp service
 */
@Injectable()
export class InfoteamIdpService {
  /** The object for logging */
  private readonly logger = new Logger(InfoteamIdpService.name);
  /** The url of infoteam idp service */
  private idpUrl: string;
  /** setting the idpUrl and Using httpService and configService */
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.idpUrl = this.configService.getOrThrow<string>('IDP_URL') + '/oauth';
  }

  /**
   * this method is used to get the access token from the idp
   * @param code this is the code that is returned from the idp
   * @param redirectUri this is the redirect uri that is used to get the code
   * @returns accessToken, refreshToken
   */
  async getAccessTokenFromIdP(
    code: string,
    redirectUri: string,
  ): Promise<IdpJwtResponse> {
    this.logger.log('getAccessTokenFromIdP called');
    const url = this.idpUrl + '/token';
    const accessTokenResponse = await firstValueFrom(
      this.httpService
        .post<IdpJwtResponse>(
          url,
          {
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            auth: {
              username: this.configService.getOrThrow<string>('IDP_CLIENT_ID'),
              password:
                this.configService.getOrThrow<string>('IDP_CLIENT_SECRET'),
            },
          },
        )
        .pipe(
          catchError((err: AxiosError) => {
            if (err instanceof AxiosError && err.response?.status === 401) {
              this.logger.debug('user invalid code');
              throw new UnauthorizedException();
            }
            this.logger.error(err);
            this.logger.error(err.response?.data);
            throw new InternalServerErrorException();
          }),
        ),
    );
    this.logger.log('getAccessTokenFromIdP success');
    return accessTokenResponse.data;
  }

  /**
   * this method is used to get the user info from the idp
   * @param accessToken this is the access token that is returned from the idp
   * @returns user info
   */
  async getUserInfo(accessToken: string): Promise<UserInfo> {
    this.logger.log('getUserInfo called');
    const url = this.idpUrl + '/userinfo';
    const userInfoResponse = await firstValueFrom(
      this.httpService
        .get<IdpUserInfoRes>(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((err) => {
            if (err instanceof AxiosError && err.response?.status === 401) {
              this.logger.debug('user invalid access token');
              throw new UnauthorizedException();
            }
            this.logger.error(err);
            throw new InternalServerErrorException();
          }),
        ),
    );
    this.logger.log('getUserInfo success');
    const { name, email, sub: uuid } = userInfoResponse.data;
    return { name, email, uuid };
  }
}
