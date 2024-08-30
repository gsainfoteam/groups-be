import { Prisma } from '@prisma/client';

export type GroupWithUserRole = Prisma.GroupGetPayload<{
  include: {
    UserRole: true;
  };
}>;
