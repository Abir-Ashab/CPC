import { Controller, Get, Param, Patch, Body, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./schema/user.schema";
import { UpdateUserDto } from "./dto/user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: any): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
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
