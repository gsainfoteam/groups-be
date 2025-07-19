import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from '../role.service';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      throw new ForbiddenException(
        'Required permissions not configured for this endpoint',
      );
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // GroupsGuard 통과하고 얻은 user
    const groupUuid = request.params.uuid; // Param으로 받은 groupUuid

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
    const userPermissions = new Set<Permission>();
    userRoles.list.forEach((userRole) => {
      userRole.permissions.forEach((auth) => {
        userPermissions.add(auth);
      });
    });

    // 요청한 API에서 요구하는 권한들을 가지고 있는지 체크
    const hasRequiredPermissions = requiredPermissions.every((auth) =>
      userPermissions.has(auth),
    );

    if (!hasRequiredPermissions) {
      throw new ForbiddenException(
        'User does not have the required permissions for this action',
      );
    }

    return true;
  }
}
