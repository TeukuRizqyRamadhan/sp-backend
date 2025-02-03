import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mengaktifkan CORS agar bisa diakses dari frontend React
  app.enableCors({
    origin: '*', // Sesuaikan dengan URL frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Jika menggunakan cookie atau token dalam header
  });

  await app.listen(3000, '0.0.0.0', () =>
    console.log('Server running on port 3000'),
  );
}
bootstrap();
