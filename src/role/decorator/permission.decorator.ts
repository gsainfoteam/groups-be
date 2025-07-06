import { SetMetadata } from '@nestjs/common';
import { Authority } from '@prisma/client';

export const AUTHORITIES_KEY = 'authorities';

export const Authorities = (...authorities: Authority[]) => {
  return SetMetadata(AUTHORITIES_KEY, authorities);
};
