import { IsOptional, IsString, IsEnum } from "class-validator";
import { Role } from "./user.dto";

export class SearchUsersDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
