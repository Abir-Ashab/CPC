import { SetMetadata } from "@nestjs/common";
import { Role } from "src/modules/users/dto/user.dto";

export const ROLES_KEY = "roles";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
