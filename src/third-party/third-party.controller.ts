import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpRedirectResponse,
  Post,
  Query,
  Redirect,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
  ApiOAuth2,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ThirdPartyService } from './third-party.service';
import { AuthorizeReqDto } from './dto/req/authorizeReq.dto';
import { TokenReqDto } from './dto/req/tokenReq.dto';
import { TokenResDto } from './dto/res/tokenRes.dto';
import { UserGuard } from 'src/auth/guard/user.guard';
import { GetUser } from 'src/auth/decorator/getUser.decorator';
import { User } from '@prisma/client';
import { UserRoleInfoResDto } from './dto/res/userRoleInfoRes.dto';
import { ThirdPartyGuard } from './guard/third-party.guard';

@ApiTags('Third Party')
@Controller('third-party')
@UseInterceptors(ClassSerializerInterceptor)
export class ThirdPartyController {
  constructor(private readonly thirdPartyService: ThirdPartyService) {}

  @ApiOperation({
    summary: 'Authorize a third-party client',
    description:
      'Redirects to the authorization URL for the third-party client.',
  })
  @ApiFoundResponse({
    description:
      'it move to client uri with certain query parameters, ex) https://client.com/callback?code=123',
  })
  @ApiBadRequestResponse({ description: 'invalid request' })
  @ApiOAuth2(['openid', 'email', 'profile'])
  @Redirect()
  @Get('authorize')
  @UseGuards(UserGuard)
  async authorize(
    @Query() query: AuthorizeReqDto,
    @GetUser() user: User,
  ): Promise<HttpRedirectResponse> {
    return {
      url: await this.thirdPartyService.authorize(query, user.uuid),
      statusCode: 302,
    };
  }

  @ApiOperation({
    summary: 'Exchange authorization code for access token',
    description:
      'Exchanges the authorization code for an access token and returns it.',
  })
  @ApiCreatedResponse({
    description: 'Returns the access token and its metadata.',
    type: TokenResDto,
  })
  @Post('token')
  async token(@Body() body: TokenReqDto): Promise<TokenResDto> {
    return this.thirdPartyService.token(body);
  }

  @ApiOperation({
    summary: 'Get user information for a third-party client',
    description:
      'Retrieves user role information for the specified third-party client.',
  })
  @ApiOkResponse({
    description: 'Returns user role information for the third-party client.',
    type: [UserRoleInfoResDto],
  })
  @ApiUnauthorizedResponse({ description: 'Invalid request' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBearerAuth('third-party')
  @UseGuards(ThirdPartyGuard)
  @Get('userinfo')
  async userinfo(
    @GetUser()
    { userUuid, clientUuid }: { userUuid: string; clientUuid: string },
  ): Promise<UserRoleInfoResDto[]> {
    return this.thirdPartyService.userinfo(userUuid, clientUuid);
  }
}
