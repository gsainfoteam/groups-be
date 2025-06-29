import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientAccessTokenRequest,
  ClientAccessTokenResponse,
  IdpUserInfoRes,
  IdTokenPayload,
} from './types/idp.type';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { UserInfo } from './types/userInfo.type';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

/**
 * This is the helper Class for infoteam idp service
 */
@Injectable()
export class InfoteamIdpService implements OnModuleInit {
  /** The object for logging */
  private readonly logger = new Logger(InfoteamIdpService.name);
  /** The url of infoteam idp service */
  private idpUrl: string;
  /** The pk of the openid key */
  private openidPk: crypto.KeyObject;
  /** The client idp access token */
  private clientAccessToken: string;
  /** The expire time of the client idp access token */
  private clientAccessTokenExpireAt: Date;
  /** setting the idpUrl and Using httpService and configService */
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.idpUrl = this.configService.getOrThrow<string>('IDP_URL');
    this.clientAccessTokenExpireAt = new Date();
  }

  /**
   * This method is called when the module is initialized to fetch the OpenID public key from Infoteam IdP.
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('InfoteamIdpService initialized');
    const openidResponse = await firstValueFrom(
      this.httpService
        .get<{ keys: crypto.JsonWebKey[] }>(this.idpUrl + '/oauth/certs')
        .pipe(
          catchError(() => {
            this.logger.error('Error fetching OpenID public key');
            throw new InternalServerErrorException();
          }),
        ),
    );
    if (!openidResponse.data.keys[0]) {
      this.logger.error('No OpenID public key found');
      throw new InternalServerErrorException('No OpenID public key found');
    }
    this.openidPk = crypto.createPublicKey({
      format: 'jwk',
      key: openidResponse.data.keys[0],
    });
    this.updateClientAccessToken();
  }

  /**
   * this method is used to validate the access token and get user info from the idp
   * @param accessToken this is the access token that is returned from the idp
   * @returns user info
   */
  async validateAccessToken(accessToken: string): Promise<UserInfo> {
    const userInfoResponse = await firstValueFrom(
      this.httpService
        .get<IdpUserInfoRes>(this.idpUrl + '/oauth/userinfo', {
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
    const {
      sub: uuid,
      name,
      email,
      picture,
      profile,
      student_id: studentId,
    } = userInfoResponse.data;
    return { name, email, uuid, picture, profile, studentId };
  }

  /**
   * this method is used to validate the id token and get user info from the idp
   * @param idToken this is the id token that is returned from the idp
   * @returns user info
   */
  async validateIdToken(idToken: string): Promise<UserInfo | null> {
    return this.jwtService
      .verifyAsync<IdTokenPayload>(idToken, {
        publicKey: this.openidPk.export({ format: 'pem', type: 'spki' }),
      })
      .then(
        ({
          sub: uuid,
          name,
          email,
          picture,
          profile,
          student_id: studentId,
        }) => ({
          uuid,
          name,
          email,
          picture,
          profile,
          studentId,
        }),
      )
      .catch(() => {
        return null;
      });
  }

  /**
   * This method is used to get user info from the idp with client access token
   * @param userUuid the uuid of the user
   * @returns user info
   */
  async getUserInfo(userUuid: string): Promise<UserInfo | null> {
    const userInfoResponse = await firstValueFrom(
      this.httpService
        .get<IdpUserInfoRes>(this.idpUrl + '/oauth/userinfo', {
          headers: {
            Authorization: `Bearer ${this.clientAccessToken}`,
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
    const {
      sub: uuid,
      name,
      email,
      picture,
      profile,
      student_id: studentId,
    } = userInfoResponse.data;
    return { name, email, uuid, picture, profile, studentId };
  }

  /**
   * This method is used to update the client access token
   * It will fetch a new token if the current one is expired
   */
  private async updateClientAccessToken(): Promise<void> {
    if (this.clientAccessTokenExpireAt > new Date()) {
      return;
    }
    this.logger.log('Client access token is expired, fetching a new one');
    const clientTokenResponse = await firstValueFrom(
      this.httpService
        .post<ClientAccessTokenResponse, ClientAccessTokenRequest>(
          this.idpUrl + '/oauth/token',
          {
            grant_type: 'client_credentials',
            client_id: this.configService.getOrThrow<string>('IDP_CLIENT_ID'),
            client_secret:
              this.configService.getOrThrow<string>('IDP_CLIENT_SECRET'),
            scope: ['profile', 'email'].join(' '),
          },
        )
        .pipe(
          catchError((err: AxiosError) => {
            this.logger.error('Error fetching client access token', err);
            throw new InternalServerErrorException(
              'Failed to fetch client access token',
            );
          }),
        ),
    );
    this.clientAccessToken = clientTokenResponse.data.access_token;
    this.clientAccessTokenExpireAt = new Date(
      Date.now() + clientTokenResponse.data.expires_in * 1000,
    );
  }
}
