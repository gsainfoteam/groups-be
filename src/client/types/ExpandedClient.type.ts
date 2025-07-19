import { Prisma } from '@prisma/client';

export type ExpandedClient = Prisma.ClientGetPayload<{
  include: {
    ExternalPermission: true;
  };
}>;
