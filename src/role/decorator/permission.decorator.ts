import { SetMetadata } from '@nestjs/common';
import { Permission } from '@prisma/client';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (...permissions: Permission[]) => {
  return SetMetadata(PERMISSIONS_KEY, permissions);
};
