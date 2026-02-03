import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

//  Register helmet (EXPRESS VERSION)
  app.use(
    helmet({
      contentSecurityPolicy: false, // disable CSP for local development OR when using inline scripts
    })
  );
  
  // Enable CORS for frontend development
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  await app.listen(3000);
  console.log('✓ Server is running on http://localhost:3000');
}
bootstrap();
