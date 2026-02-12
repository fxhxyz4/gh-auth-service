import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { GitHubProfile } from "../common/strategies/github.strategy";
import { JwtPayload } from "../common/strategies/jwt.strategy";

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    avatarUrl?: string;
    profileUrl: string;
  };
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(githubUser: GitHubProfile & { accessToken: string }): Promise<AuthResponse> {
    const primaryEmail = githubUser.emails.find((e) => e.primary)?.value || githubUser.emails[0]?.value;

    const payload: JwtPayload = {
      sub: githubUser.id,
      username: githubUser.username,
      email: primaryEmail,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: githubUser.id,
        username: githubUser.username,
        displayName: githubUser.displayName,
        email: primaryEmail,
        avatarUrl: githubUser.photos[0]?.value,
        profileUrl: githubUser.profileUrl,
      },
    };
  }

  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }
  }
}
