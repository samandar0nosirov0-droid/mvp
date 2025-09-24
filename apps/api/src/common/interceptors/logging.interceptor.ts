import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const started = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.logSuccess(method, url, started, context),
        error: (error) => this.logError(method, url, started, error)
      })
    );
  }

  private logSuccess(method: string, url: string, started: number, context: ExecutionContext) {
    const response = context.switchToHttp().getResponse<Response & { statusCode?: number }>();
    const status = response?.statusCode ?? 200;
    this.logger.log(`${method} ${url} ${status} - ${Date.now() - started}ms`);
  }

  private logError(method: string, url: string, started: number, error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    this.logger.error(`${method} ${url} - ${message} - ${Date.now() - started}ms`);
  }
}
