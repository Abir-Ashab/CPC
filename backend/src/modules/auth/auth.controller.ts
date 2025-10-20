import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const user = req.user as any;
      if (!user)
        throw new UnauthorizedException("Google authentication failed");

      const tokens = this.authService.getTokens(user);

      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return { message: "Login successful", user };
    } catch (err) {
      throw new UnauthorizedException("Google callback failed");
    }
  }

  @Post("refresh")
  @UseGuards(AuthGuard("jwt-refresh"))
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const user = req.user as any;
      if (!user) throw new UnauthorizedException("Invalid refresh token");

      const tokens = this.authService.refreshTokens(user);

      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { message: "Token refreshed successfully" };
    } catch (err) {
      throw new UnauthorizedException("Refresh token failed");
    }
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  async getMe(@Req() req: Request) {
    if (!req.user) throw new UnauthorizedException("User not authenticated");
    return req.user;
  }

  @Get("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return { message: "Logged out successfully" };
  }
}
