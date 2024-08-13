import { Prisma } from '@prisma/client';

export type GroupWithRole = Prisma.GroupGetPayload<{
  include: {
    Role: {
      include: {
        RoleExternalAuthority: true;
      };
    };
  };
}>;
