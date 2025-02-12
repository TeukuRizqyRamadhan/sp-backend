import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Jika menggunakan cookie atau token dalam header
  });

  await app.listen(3000, '0.0.0.0', () =>
    console.log('Server running on port 3000'),
  );
}
bootstrap();
