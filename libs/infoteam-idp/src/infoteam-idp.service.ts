import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IdPTokenRes, IdpUserInfoRes } from './types/idp.type';
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
  private readonly idpUrl: string;
  /** client token of the idp service */
  private clientToken: string;
  /** client token expire time */
  private clientTokenExpireTime: Date;
  /** setting the idpUrl and Using httpService and configService */
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.idpUrl = this.configService.getOrThrow<string>('IDP_URL') + '/oauth';
  }

  /**
   * this method is used to get the user info from the idp through the access token from the code flow
   * @param accessToken this is the access token that is returned from the idp
   * @returns user info
   */
  async getUserInfoWithAccessToken(accessToken: string): Promise<UserInfo> {
    this.logger.log('getUserInfo called');
    const userInfoResponse = await firstValueFrom(
      this.httpService
        .get<IdpUserInfoRes>(this.idpUrl + '/userinfo', {
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
    const {
      name,
      email,
      phone_number: phoneNumber,
      student_id: studentNumber,
      sub: uuid,
    } = userInfoResponse.data;
    return { name, email, phoneNumber, studentNumber, uuid };
  }

  /**
   * this method is used to get the user info from the idp through the user uuid
   * @param userUuid this is the user uuid that is returned from the idp
   * @returns user info
   */
  async getUserInfoWithUserUuid(userUuid: string): Promise<UserInfo> {
    this.logger.log('getUserInfoWithUserUuid called');
    const accessToken = await this.getClientToken();
    const userInfoResponse = await firstValueFrom(
      this.httpService
        .get<IdpUserInfoRes>(this.idpUrl + '/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            sub: userUuid,
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
    const {
      name,
      email,
      phone_number: phoneNumber,
      student_id: studentNumber,
      sub: uuid,
    } = userInfoResponse.data;
    return { name, email, phoneNumber, studentNumber, uuid };
  }

  /**
   * this method is used to get the client token from the idp through the client credential flow
   * @returns client token
   */
  private async getClientToken(): Promise<string> {
    this.logger.log('getClientToken called');
    if (this.clientToken && this.clientTokenExpireTime > new Date()) {
      this.logger.log('getClientToken success');
      return this.clientToken;
    }
    const clientId = this.configService.getOrThrow<string>('IDP_CLIENT_ID');
    const clientSecret =
      this.configService.getOrThrow<string>('IDP_CLIENT_SECRET');
    const tokenResponse = await firstValueFrom(
      this.httpService
        .post<IdPTokenRes>(this.idpUrl + '/token', null, {
          auth: {
            username: clientId,
            password: clientSecret,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          params: {
            grant_type: 'client_credentials',
          },
        })
        .pipe(
          catchError((err) => {
            this.logger.error(err);
            throw new InternalServerErrorException();
          }),
        ),
    );
    const { access_token: accessToken, expires_in: expiresIn } =
      tokenResponse.data;
    this.clientToken = accessToken;
    this.clientTokenExpireTime = new Date(Date.now() + expiresIn);
    this.logger.log('getClientToken success');
    return accessToken;
  }
}
