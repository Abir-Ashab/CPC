import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsOptional, IsString, IsEnum, IsMongoId, IsDate } from "class-validator";

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  googleId?: string;

  @IsMongoId()
  @IsOptional()
  votedPhotoId?: string;

  @IsDate()
  @IsOptional()
  votedAt?: Date;
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }