import { Prisma } from '@prisma/client';

export type UserRoleInfo = Prisma.RoleGetPayload<{
  include: {
    RoleExternalPermission: {
      include: {
        ExternalPermission: true;
      };
    };
  };
}>;
