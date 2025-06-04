import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthMiddleware } from './admin-panel/auth/auth.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades que não estão no DTO (recomendado)
      forbidNonWhitelisted: true, // Lança erro se propriedades não listadas forem enviadas (recomendado)
      transform: true, // ESSENCIAL: Habilita a transformação de payload
      transformOptions: {
        enableImplicitConversion: true, // ESSENCIAL: Permite a conversão implícita de tipos (ex: string para número)
      },
    }),
  );
  app.use(new AuthMiddleware().use); 
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
