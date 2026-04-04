import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  const config = new DocumentBuilder()
  .setTitle('Knowledge Hub')
  .setDescription(' Knowledge Hub API')
  .setVersion('1.0')
  .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
