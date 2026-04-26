import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  ValidationPipe,
  Logger,
  ConsoleLogger,
  LogLevel,
} from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const logLevel = (process.env.LOG_LEVEL ?? 'log') as LogLevel;
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      logLevels: [logLevel],
    }),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Knowledge Hub')
    .setDescription(' Knowledge Hub API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 4000);

  process.on('uncaughtException', async (err) => {
    logger.error('Uncaught Exception', err.stack);
    await app.close();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason: unknown) => {
    logger.error('Unhandled Rejection', String(reason));
    await app.close();
    process.exit(1);
  });
}
bootstrap();
