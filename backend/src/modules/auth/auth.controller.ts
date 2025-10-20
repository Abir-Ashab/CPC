import { Controller, Get, Req, Res, UseGuards, Post } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { Response, Request } from "express";
import { JwtAuthDto } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --- Google OAuth login ---
  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() {}

  // --- Google OAuth callback ---
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<JwtAuthDto> {
    const tokens = await this.authService.getTokens(req.user as any);

    res.cookie("Access", tokens.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("Refresh", tokens.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return tokens;
  }

  // --- Refresh tokens ---
  @Post("refresh")
  @UseGuards(AuthGuard("jwt-refresh"))
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as any;
    const tokens = await this.authService.refreshTokens(user);

    res.cookie("Access", tokens.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });
    return tokens;
  }

  // --- Logout ---
  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("Access");
    res.clearCookie("Refresh");
    return { message: "Logged out successfully" };
  }

  // --- Current user info ---
  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  getMe(@Req() req: Request) {
    // req.user is set by JwtStrategy
    return req.user;
  }
}
