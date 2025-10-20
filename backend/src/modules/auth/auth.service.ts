import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "../users/dto/user.dto";
import { User } from "../users/schema/user.schema";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleUser(userDto: CreateUserDto): Promise<User> {
    let user = await this.usersService.findByGoogleId(userDto.googleId);
    if (!user) {
      user = await this.usersService.createUser(userDto);
    }
    return user;
  }

  async getTokens(user: User) {
    const payload = { email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: "15m",
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(user: User) {
    return this.getTokens(user);
  }
}
