import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { validateEnv } from "@forge/config/env";

async function bootstrap() {
  validateEnv(process.env);

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix("api");

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

void bootstrap();
