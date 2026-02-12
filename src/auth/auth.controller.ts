import { Controller, Get, Query, Req, Res, UseGuards, BadRequestException } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { GithubAuthGuard } from "../common/guards/github-auth.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Public } from "../common/decorators/public.decorator";
import { User } from "../common/decorators/user.decorator";
import { AppConfigService } from "../config/app-config.service";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private appConfigService: AppConfigService,
  ) {}

  @Public()
  @Get("github")
  @UseGuards(GithubAuthGuard)
  async githubAuth(@Query("client_id") clientId?: string, @Query("redirect_uri") _redirectUri?: string) {
    if (clientId) {
      const client = this.appConfigService.getGitHubClient(clientId);
      if (!client) {
        throw new BadRequestException("Invalid client_id");
      }
    }
  }

  @Public()
  @Get("github/callback")
  @UseGuards(GithubAuthGuard)
  async githubAuthCallback(
    @Req() req: any,
    @Res() res: Response,
    @Query("state") state?: string,
    @Query("error") error?: string,
  ) {
    console.log("🔍 GitHub callback received");
    console.log("User:", req.user);
    console.log("State:", state);
    console.log("Error:", error);

    if (error) {
      console.log("OAuth error:", error);
      return res.redirect(`${this.getRedirectUri(state)}?error=${error}`);
    }

    try {
      const authResponse = await this.authService.login(req.user);
      const redirectUri = this.getRedirectUri(state);

      console.log("Auth successful, redirecting to:", redirectUri);
      console.log("Token:", authResponse.accessToken.substring(0, 20) + "...");

      return res.redirect(
        `${redirectUri}?token=${authResponse.accessToken}&user=${encodeURIComponent(
          JSON.stringify(authResponse.user),
        )}`,
      );
    } catch (err) {
      console.error("Auth error:", err);
      return res.redirect(`${this.getRedirectUri(state)}?error=authentication_failed`);
    }
  }

  @Public()
  @Get("validate")
  async validateToken(@Query("token") token: string) {
    if (!token) {
      throw new BadRequestException("Token is required");
    }

    const payload = await this.authService.validateToken(token);

    if (!payload) {
      return {
        valid: false,
        message: "Invalid or expired token",
      };
    }

    return {
      valid: true,
      user: {
        userId: payload.sub,
        username: payload.username,
        email: payload.email,
      },
    };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@User() user: any) {
    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
    };
  }

  @Public()
  @Get("health")
  health() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      clients: this.appConfigService.getAllGitHubClients().length,
    };
  }

  private getRedirectUri(state?: string): string {
    if (state) {
      try {
        const decoded = Buffer.from(state, "base64").toString();
        return decoded;
      } catch {
        // error
      }
    }

    // Default redirect
    return process.env.DEFAULT_REDIRECT_URI || "http://localhost:3001/auth/callback";
  }
}
