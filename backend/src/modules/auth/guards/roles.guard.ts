import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "src/modules/users/dto/user.dto";
import { ROLES_KEY } from "../decorators/roles.decorators";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role restriction
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      // JwtAuthGuard should ensure this never happens
      throw new ForbiddenException("User not authenticated");
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `User with role '${user.role}' cannot access this resource`,
      );
    }

    return true;
  }
}
