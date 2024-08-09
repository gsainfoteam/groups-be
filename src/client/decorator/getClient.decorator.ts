import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Client } from '@prisma/client';

export const GetClient = createParamDecorator(
  (data, ctx: ExecutionContext): Client => {
    return ctx.switchToHttp().getRequest().user;
  },
);
