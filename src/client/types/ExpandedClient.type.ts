import { Prisma } from '@prisma/client';

export type ExpandedClient = Prisma.ClientGetPayload<{
  include: {
    ExternalAuthority: true;
  };
}>;
