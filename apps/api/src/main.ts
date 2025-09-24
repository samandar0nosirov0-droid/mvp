import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ErrorsInterceptor } from './common/interceptors/errors.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: (process.env.WEB_APP_URL ?? 'http://localhost:3000').split(','),
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  app.useGlobalInterceptors(new LoggingInterceptor(), new ErrorsInterceptor());
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Ошибка запуска API', error);
  process.exit(1);
});
