import { IsOptional, IsString, } from "class-validator";

export class SearchUsersDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsString()
  @IsOptional()
  role?: string;
}
