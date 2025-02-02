import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService) { }

    async login(email: string, password: string) {
        if (!email) {
            throw new Error('Email tidak boleh kosong');
        }

        const admin = await this.prisma.admin.findUnique({
            where: { email },
        });

        // logika cek password
        if (!admin) {
            throw new Error('Admin tidak ditemukan');
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            throw new Error('Password salah');
        }

        console.log('Hasil query:', admin); // Debugging

        if (!admin) {
            throw new Error('Admin tidak ditemukan');
        }

        return {
            token: this.jwt.sign({ id: admin.id, email: admin.email }),
        };
    }
}
