import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { User } from "../users/schema/user.schema";
import { envVars } from "src/config/env";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(profile: any): Promise<User> {
    let user = await this.usersService.findByGoogleId(profile.googleId);
    if (!user) {
      user = await this.usersService.createUser(profile);
    }
    return user;
  }

  async getUserById(id: string) {
    return this.usersService.findById(id);
  }

  getTokens(user: User) {
    const payload = { sub: user._id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: envVars.JWT.JWT_SECRET,
      expiresIn: "15m",
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: envVars.JWT.JWT_REFRESH_SECRET,
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  refreshTokens(user: User) {
    return this.getTokens(user);
  }
}
