import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "../auth.service";
import { envVars } from "src/config/env";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: envVars.GOOGLE_CLIENT.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CLIENT.GOOGLE_CALLBACK_URL,
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      const { id, emails, displayName, photos } = profile;
      if (!emails || emails.length === 0) {
        throw new UnauthorizedException("Google account has no email");
      }

      const user = await this.authService.validateGoogleUser({
        googleId: id,
        email: emails[0].value,
        name: displayName,
        avatar: photos?.[0]?.value,
      });

      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}
