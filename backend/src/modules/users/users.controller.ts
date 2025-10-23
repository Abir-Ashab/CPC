import { Controller, Get, Param, Patch, Body, Post, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./schema/user.schema";
import { Role, UpdateUserDto } from "./dto/user.dto";
import { Auth } from "../auth/decorators/auth.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Auth(Role.ADMIN)
  async createUser(@Body() createUserDto: any): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @Auth(Role.ADMIN)
  async getAllUsers(
    @Query('query') query?: string,
    @Query('role') role?: Role
  ): Promise<User[]> {
    return this.usersService.findAll(query, role);
  }
  @Get(":id")
  async getUser(@Param("id") id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Patch(":id")
  async updateUser(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }
}
