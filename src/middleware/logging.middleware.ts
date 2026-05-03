import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction, query } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const body = { ...req.body };
    if (body.password) body.password = '[REDACTED]';
    if (body.token) body.token = '[REDACTED]';
    this.logger.log(
      `--> ${req.method} ${req.originalUrl} ${JSON.stringify({ query: req.query, body })}`,
    );

    res.on('finish', () => {
      const ms = Date.now() - start;
      this.logger.log(`<-- ${res.statusCode} ${ms}ms`);
    });
    next();
  }
}
