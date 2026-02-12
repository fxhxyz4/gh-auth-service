import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface GitHubClient {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

@Injectable()
export class AppConfigService {
  private githubClient: GitHubClient;

  constructor(private configService: ConfigService) {
    this.initializeGitHubClient();
  }

  private initializeGitHubClient(): void {
    const clientId = this.configService.get<string>("GITHUB_CLIENT_ID");
    const clientSecret = this.configService.get<string>("GITHUB_CLIENT_SECRET");
    const callbackUrl = this.configService.get<string>("GITHUB_CALLBACK_URL");

    if (!clientId || !clientSecret || !callbackUrl) {
      throw new Error("GitHub OAuth configuration is incomplete");
    }

    this.githubClient = {
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
      callbackUrl: callbackUrl.trim(),
    };

    console.log("✅ GitHub OAuth configured:", {
      clientId: this.githubClient.clientId,
      callbackUrl: this.githubClient.callbackUrl,
    });
  }

  getGitHubClient(clientId?: string): GitHubClient {
    return this.githubClient;
  }

  getAllGitHubClients(): GitHubClient[] {
    return [this.githubClient];
  }

  getFirstGitHubClient(): GitHubClient {
    return this.githubClient;
  }

  get jwtSecret(): string {
    return this.configService.get<string>("JWT_SECRET", "default-secret-change-me");
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>("JWT_EXPIRES_IN", "7d");
  }

  get port(): number {
    return this.configService.get<number>("PORT", 3000);
  }

  get allowedOrigins(): string[] {
    const origins = this.configService.get<string>("ALLOWED_ORIGINS", "");
    return origins ? origins.split(",").map((o) => o.trim()) : ["*"];
  }

  get githubScopes(): string[] {
    const scopes = this.configService.get<string>("GITHUB_SCOPES", "user:email,read:user");
    return scopes.split(",").map((s) => s.trim());
  }
}
