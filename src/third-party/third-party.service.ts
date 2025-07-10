import { Injectable } from '@nestjs/common';
import { AuthorizeReqDto } from './dto/req/authorizeReq.dto';
import { TokenResDto } from './dto/res/tokenRes.dto';
import { TokenReqDto } from './dto/req/tokenReq.dto';

@Injectable()
export class ThirdPartyService {
  constructor() {}

  async authorize({
    clientId,
    redirectUri,
  }: AuthorizeReqDto): Promise<string> {}

  async token({
    clientId,
    code,
    redirectUri,
  }: TokenReqDto): Promise<TokenResDto> {}
}
