import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GroupsGuard } from './guard/groups.guard';
import { GetUser } from './decorator/getUser.decorator';
import { User } from '@prisma/client';
import {
  ApiOAuth2,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenDto } from './dto/res/accessTokenRes.dto';
import { UserResDto } from './dto/res/userRes.dto';
import { LoginQueryDto } from './dto/req/login.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Login callback',
    description: 'groups IdP token을 발급받습니다.',
  })
  @ApiOkResponse({
    type: AccessTokenDto,
    description: 'groups IdP token',
  })
  @Get('login')
  async login(
    @Query() { code, redirectUri }: LoginQueryDto,
  ): Promise<AccessTokenDto> {
    return this.authService.login(code, redirectUri);
  }

  @ApiOperation({
    summary: 'Get user information',
    description:
      '사용자 정보를 조회합니다. 이떄, 사용자 정보는 groups에 저장된 정보만을 가져옵니다.',
  })
  @ApiOAuth2(['openid', 'email', 'profile'])
  @ApiOkResponse({
    type: UserResDto,
    description: 'User information',
  })
  @Get('info')
  @UseGuards(GroupsGuard)
  async getUserInfo(@GetUser() user: User): Promise<UserResDto> {
    return user;
  }
}
