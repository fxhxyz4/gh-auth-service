import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "./config/config.module";
import { AppConfigService } from "./config/app-config.service";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { Reflector } from "@nestjs/core";

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ConfigModule,
    AuthModule,
  ],
  providers: [
    AppConfigService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    Reflector,
  ],
})
export class AppModule {}
