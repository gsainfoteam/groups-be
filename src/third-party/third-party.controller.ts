import {
  Body,
  Controller,
  Get,
  HttpRedirectResponse,
  Post,
  Query,
  Redirect,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThirdPartyService } from './third-party.service';
import { AuthorizeReqDto } from './dto/req/authorizeReq.dto';
import { TokenReqDto } from './dto/req/tokenReq.dto';
import { TokenResDto } from './dto/res/tokenRes.dto';

@ApiTags('Third Party')
@Controller('third-party')
export class ThirdPartyController {
  constructor(private readonly thirdPartyService: ThirdPartyService) {}

  @Redirect()
  @Get('authorize')
  async authorize(
    @Query() query: AuthorizeReqDto,
  ): Promise<HttpRedirectResponse> {
    return {
      url: await this.thirdPartyService.authorize(query),
      statusCode: 302,
    };
  }

  @Post('token')
  async token(@Body() body: TokenReqDto): Promise<TokenResDto> {
    return this.thirdPartyService.token(body);
  }

  @Get('userinfo')
  async userinfo() {
    return;
  }
}
