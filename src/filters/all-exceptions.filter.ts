import { Response } from 'express';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
} from 'src/errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

    let status: number;
    let error: string;
    let message: string;

    const customErrors = [
      NotFoundError,
      ValidationError,
      UnauthorizedError,
      ForbiddenError,
    ];
    const isCustomError = customErrors.some((cls) => exception instanceof cls);

    if (isCustomError) {
      status = (exception as NotFoundError).statusCode;
      message = (exception as Error).message;
      error = (exception as Error).name;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      error = exception.message;
      message = exception.message;
    } else {
      status = 500;
      error = 'Internal Server Error';
      message = 'An unexpected error occurred';
    }

    response.status(status).json({
      statusCode: status,
      error: error,
      message: message,
    });
  }
}
