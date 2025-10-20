import { applyDecorators, UseGuards } from "@nestjs/common";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "./roles.decorators";
import { Role } from "src/modules/users/dto/user.dto";
import { JwtAuthGuard } from "../guards/auth,guard";

export function Auth(...roles: Role[]) {
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));
}
