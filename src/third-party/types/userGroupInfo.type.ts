import { Prisma } from '@prisma/client';

export type UserGroupInfo = Prisma.GroupGetPayload<{
  include: {
    Role: {
      include: {
        RoleExternalPermission: true;
      };
    };
  };
}>;
