import { Prisma } from '@prisma/client';

export type ExpandedGroup = Prisma.GroupGetPayload<{
  include: {
    _count: {
      select: {
        UserGroup: true;
      };
    };
  };
}>;
