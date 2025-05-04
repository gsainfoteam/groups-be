import { Controller, Post, UseGuards } from '@nestjs/common';
import { GetUser } from './decorator/getUser.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/res.dto';
import { IdpIdtokenGuard } from './guard/idpIdtoken.guard';
import { UserInfo } from '@lib/infoteam-idp';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Login',
    description: 'IdP Token을 통해서 Groups에 로그인 합니다.',
  })
  @ApiOkResponse({
    type: AccessTokenDto,
    description: 'groups IdP token',
  })
  @UseGuards(IdpIdtokenGuard)
  @Post('login')
  async login(@GetUser() userInfo: UserInfo): Promise<AccessTokenDto> {
    return this.authService.login(userInfo.uuid);
  }
}
