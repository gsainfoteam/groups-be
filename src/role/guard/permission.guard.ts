import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from '../role.service';
import { Authority } from '@prisma/client';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAuthorities = this.reflector.getAllAndOverride<Authority[]>(
      'authorities',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredAuthorities) {
      return false; // 이 guard를 썼는데, 필요 권한 안 걸어두면 통과 X
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // GroupsGuard 통과하고 얻은 user
    const groupUuid = request.params.groupUuid; // Param으로 받은 groupUuid

    if (!groupUuid) {
      throw new ForbiddenException('Group UUID is required');
    }

    const userRoles = await this.roleService.getRoles(groupUuid, user.uuid);

    if (!userRoles.list.length) {
      throw new ForbiddenException(
        'User is not part of this group or has no roles',
      );
    }

    // 유저가 가진 모든 권한을 중복 없이 추출
    const userAuthorities = new Set<Authority>();
    userRoles.list.forEach((userRole) => {
      userRole.authorities.forEach((auth) => {
        userAuthorities.add(auth);
      });
    });

    // 요청한 API에서 요구하는 권한들을 가지고 있는지 체크
    const hasRequiredAuthorities = requiredAuthorities.every((auth) =>
      userAuthorities.has(auth),
    );

    if (!hasRequiredAuthorities) {
      throw new ForbiddenException(
        'User does not have the required authorities for this action',
      );
    }

    return true;
  }
}
