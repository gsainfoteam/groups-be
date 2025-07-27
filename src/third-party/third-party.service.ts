import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthorizeReqDto } from './dto/req/authorizeReq.dto';
import { TokenResDto } from './dto/res/tokenRes.dto';
import { TokenReqDto } from './dto/req/tokenReq.dto';
import { ThirdPartyRepository } from './third-party.repository';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import { AuthorizeCache } from './types/authorizeCache.type';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as ms from 'ms';
import { UserRoleInfoResDto } from './dto/res/userRoleInfoRes.dto';

@Injectable()
export class ThirdPartyService {
  private readonly authorizationCodePrefix = 'authorizationCode';
  private readonly accessTokenExpireTime: number;
  constructor(
    private readonly thirdPartyRepository: ThirdPartyRepository,
    @InjectRedis() private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenExpireTime = ms(
      configService.getOrThrow('THIRD_PARTY_JWT_EXPIRES_IN') as ms.StringValue,
    );
  }

  async authorize(
    { clientId, redirectUri }: AuthorizeReqDto,
    userUuid: string,
  ): Promise<string> {
    const client = await this.thirdPartyRepository.findClientById(clientId);
    if (!client.redirectUri.includes(redirectUri)) {
      throw new ForbiddenException(
        `Redirect URI ${redirectUri} is not allowed for client ${clientId}`,
      );
    }
    const code = this.generateOpaqueToken();
    const cache: AuthorizeCache = {
      clientId,
      redirectUri,
      userUuid,
    };
    await this.redis.set(
      `${this.authorizationCodePrefix}:${code}`,
      JSON.stringify(cache),
      'EX',
      300, // 5 minutes expiration
    );
    return `${redirectUri}?code=${code}`;
  }

  async token({
    clientId,
    code,
    redirectUri,
  }: TokenReqDto): Promise<TokenResDto> {
    const cache = await this.redis.get(
      `${this.authorizationCodePrefix}:${code}`,
    );
    if (!cache) {
      throw new ForbiddenException(`Invalid authorization code ${code}`);
    }
    const {
      clientId: cachedClientId,
      redirectUri: cachedRedirectUri,
      userUuid: cachedUserUuid,
    } = JSON.parse(cache) as AuthorizeCache;
    if (cachedClientId !== clientId || cachedRedirectUri !== redirectUri) {
      throw new ForbiddenException(
        `Client ID or redirect URI does not match for code ${code}`,
      );
    }
    await this.redis.del(`${this.authorizationCodePrefix}:${code}`);

    return {
      accessToken: this.jwtService.sign({
        sub: cachedUserUuid,
        aud: cachedClientId,
      }),
      expiresIn: this.accessTokenExpireTime,
      tokenType: 'Bearer',
    };
  }

  async userinfo(
    userUuid: string,
    clientUuid: string,
  ): Promise<UserRoleInfoResDto[]> {
    const userRoleInfo =
      await this.thirdPartyRepository.findRoleByClientUuidAndUserUuid(
        clientUuid,
        userUuid,
      );
    return userRoleInfo;
  }

  /**
   * 유저의 정보와 상관이 없은 토큰을 만들어내는 함수.
   * @returns Opaque token
   */
  private generateOpaqueToken() {
    return crypto
      .randomBytes(32)
      .toString('base64')
      .replace(/[+//=]/g, '');
  }
}
