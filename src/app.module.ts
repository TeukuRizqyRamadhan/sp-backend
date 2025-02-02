import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SiswaModule } from './siswa/siswa.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, ConfigModule.forRoot(), SiswaModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
