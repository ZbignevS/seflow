import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({ origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:4201' });
  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  Logger.log(`API running on: http://localhost:${port}/api`);
}

bootstrap();
