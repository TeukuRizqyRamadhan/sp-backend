import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mengaktifkan CORS agar bisa diakses dari frontend React
  app.enableCors({
    origin: 'http://localhost:5173', // Sesuaikan dengan URL frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Jika menggunakan cookie atau token dalam header
  });

  await app.listen(3000);
}
bootstrap();
