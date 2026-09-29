import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../../src/app.module';

let cachedHandler: ReturnType<typeof serverless> | undefined;

async function bootstrap() {
  const expressApp = express();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  await app.init();

  return serverless(expressApp);
}

export const handler = async (event: any, context: any) => {
  cachedHandler ??= await bootstrap();

  if (!cachedHandler) {
    throw new Error('Failed to initialize Netlify handler');
  }

  return cachedHandler(event, context);
};