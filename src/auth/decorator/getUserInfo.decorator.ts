import { UserInfo } from '@lib/infoteam-idp';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): UserInfo => {
    return ctx.switchToHttp().getRequest().user;
  },
);
