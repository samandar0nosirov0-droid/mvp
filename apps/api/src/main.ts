import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ZodValidationPipe } from './zod-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.WEB_ORIGIN,
    credentials: true
  });
  app.useGlobalPipes(new ZodValidationPipe());
  await app.listen(4000);
}
bootstrap();
