import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ErrorsInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (error instanceof Error) {
          this.logger.error(error.message);
        } else {
          this.logger.error('Unknown error');
        }

        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        const safeError = new InternalServerErrorException(
          'Произошла непредвиденная ошибка. Попробуйте повторить запрос позже.'
        );

        return throwError(() => safeError);
      })
    );
  }
}
