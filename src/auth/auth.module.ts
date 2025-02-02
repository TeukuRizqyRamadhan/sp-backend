import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module'; // Tambahkan import ini

@Module({
  imports: [
    PrismaModule, // Pastikan ini diimport agar bisa digunakan di AuthService
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Gunakan env untuk JWT_SECRET
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule { }
