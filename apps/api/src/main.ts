/* eslint-env node */
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import cookieParser from 'cookie-parser';
import {ZodValidationPipe} from './zod-validation.pipe';

  // TODO: initialize Sentry and OpenTelemetry when configured
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
// eslint-disable-next-line no-undef
  app.enableCors({origin: process.env.WEB_ORIGIN, credentials: true});
  app.useGlobalPipes(new ZodValidationPipe());
  await app.listen(4000);
}
bootstrap();
