// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Authority } from '@prisma/client';

export const AUTHORITIES_KEY = 'authorities';

export const Authorities = (...authorities: Authority[]) => {
  // Authority 객체로 받아서 string 배열로 변환하여 메타데이터로 사용
  const authorityNames = authorities.map((authority) => authority.toString());
  return SetMetadata(AUTHORITIES_KEY, authorityNames);
};
