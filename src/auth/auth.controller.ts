import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { IdPGuard } from './guard/idp.guard';
import { GroupsGuard } from './guard/groups.guard';
import { GetUser } from './decorator/getUser.decorator';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  @Get()
  @UseGuards(IdPGuard)
  loginRequest(): void {}

  @Get('callback')
  @UseGuards(IdPGuard)
  login(@Req() req: any): any {
    console.log(req.user);
    return req.user;
  }

  @Get('info')
  @UseGuards(GroupsGuard)
  getUserInfo(@GetUser() user: User): any {
    return user;
  }
}
