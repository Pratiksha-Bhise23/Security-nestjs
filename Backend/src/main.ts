import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parsing for cookie-based authentication
  app.use(cookieParser());

  //  Register helmet (EXPRESS VERSION)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
        },
      },
    })
  );
  
  // Enable CORS for frontend development with proper cookie handling
  // Credentials must be true to allow cookies to be sent/received
  app.enableCors({
    origin: 'http://localhost:5173', // Specific origin (not array) for credentials
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-CSRF-Token'],
    optionsSuccessStatus: 200, // For older browsers
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
  console.log('✓ Cookie-based authentication enabled');
  console.log('✓ CSRF Protection is enabled');
}
bootstrap();
