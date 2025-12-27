
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Secure by Design: If no roles are defined, is it public? 
    // In this strict mode, we assume protected unless explicitly Public.
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('Access Denied: No User Role Identified');
    }

    // Super Admin bypass
    if (user.role === Role.SUPER_ADMIN) return true;

    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
        console.warn(`SECURITY: Unauthorized access attempt by user ${user.id}`);
        throw new ForbiddenException('Access Denied: Insufficient Privileges');
    }

    return true;
  }
}