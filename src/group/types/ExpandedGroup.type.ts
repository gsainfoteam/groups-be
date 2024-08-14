import { Prisma } from '@prisma/client';

export type ExpandedGroup = Prisma.GroupGetPayload<{
  include: {
    President: true;
    _count: {
      select: {
        UserGroup: true;
      };
    };
  };
}>;
