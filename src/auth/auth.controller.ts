import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetUser } from './decorator/getUser.decorator';
import { User } from '@prisma/client';
import {
  ApiOAuth2,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserResDto } from './dto/res/userRes.dto';
import { AuthService } from './auth.service';
import { LoginQueryDto } from './dto/req/login.dto';
import { UserGuard } from './guard/user.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Login callback',
    description: 'groups IdP token을 발급받습니다.',
  })
  @Get('login')
  async login(@Query() { token }: LoginQueryDto): Promise<void> {
    return this.authService.login(token);
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
  @UseGuards(UserGuard)
  async getUserInfo(@GetUser() user: User): Promise<UserResDto> {
    return user;
  }
}
