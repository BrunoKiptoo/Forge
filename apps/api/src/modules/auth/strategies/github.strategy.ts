import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile } from "passport-github2";
import { Strategy } from "passport-github2";
import { AuthService } from "../auth.service";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || "disabled",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "disabled",
      callbackURL: process.env.GITHUB_CALLBACK_URL ?? "http://localhost:3001/api/auth/github/callback",
      scope: ["user:email"],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error("GitHub did not return an email address");
    }

    return this.authService.validateGithubUser({
      githubId: profile.id,
      email,
      name: profile.displayName || profile.username || email.split("@")[0]!,
      avatar: profile.photos?.[0]?.value,
    });
  }
}
