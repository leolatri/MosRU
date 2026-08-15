import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import process from 'node:process';
import { ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
  .setTitle('Violations API')
  .setDescription('API приложения РЕЕСТР | Нарушений')
  .setVersion('1.0')
  .addBearerAuth()
  .build()

  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, documentFactory);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
