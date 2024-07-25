import { Prisma } from '@prisma/client';

export type GroupFullContent = Prisma.GroupGetPayload<{
  include: {
    _count: {
      select: {
        UserGroup: true;
      };
    };
  };
}>;
