import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AppConfigService } from "./config/app-config.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);

  app.enableCors({
    origin: configService.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix("api");

  const port = configService.port;
  await app.listen(port);

  console.log(`
🚀 GitHub Auth Service is running!
📍 Local: http://localhost:${port}/api
🔒 Health: http://localhost:${port}/api/auth/health
📚 Endpoints:
   - GET  /api/auth/github - Start OAuth flow
   - GET  /api/auth/github/callback - OAuth callback
   - GET  /api/auth/validate - Validate token
   - GET  /api/auth/me - Get current user (requires JWT)
  `);
}

bootstrap();
