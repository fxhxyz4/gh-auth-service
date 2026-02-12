import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";
import { AppConfigService } from "../../config/app-config.service";

export interface GitHubProfile {
  id: string;
  username: string;
  displayName: string;
  emails: Array<{ value: string; primary?: boolean; verified?: boolean }>;
  photos: Array<{ value: string }>;
  profileUrl: string;
  provider: "github";
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(private appConfigService: AppConfigService) {
    const defaultClient = appConfigService.getFirstGitHubClient();

    super({
      clientID: defaultClient.clientId,
      clientSecret: defaultClient.clientSecret,
      callbackURL: defaultClient.callbackUrl,
      scope: appConfigService.githubScopes,
    });

    console.log("GitHub Strategy initialized with callback:", defaultClient.callbackUrl);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
    try {
      const { id, username, displayName, emails, photos, profileUrl } = profile;

      const user: GitHubProfile = {
        id,
        username,
        displayName,
        emails: emails || [],
        photos: photos || [],
        profileUrl,
        provider: "github",
      };

      done(null, { ...user, accessToken });
    } catch (error) {
      done(error, null);
    }
  }
}
