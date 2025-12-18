import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS ayarları - Frontend erişimi için
  app.enableCors({
    origin: 'http://localhost:3000', // Next.js frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Accept',
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Form Builder Backend çalışıyor: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`👤 Users API: http://localhost:${port}/users/health`);
  console.log(`📝 Forms API: http://localhost:${port}/forms/health`);
}
bootstrap();