import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiswaService {
    constructor(private prisma: PrismaService) { }

    async searchSiswa(nama: string) {
        return this.prisma.siswa.findMany({
            where: {
                nama: {
                    contains: nama, // Mencari nama yang mengandung kata kunci
                    mode: 'insensitive', // Tidak case-sensitive
                },
            },
        });
    }

    async buatSP(siswaId: string, keterangan: string) {
        return this.prisma.suratPembinaan.create({
            data: {
                siswaId,
                keterangan,
            },
        });
    }

    async countSP(siswaId: string) {
        return this.prisma.suratPembinaan.count({
            where: { siswaId },
        });
    }

    async getStatistikSP() {
        const totalSiswa = await this.prisma.siswa.count();

        const totalSiswaKenaSP = await this.prisma.suratPembinaan
            .groupBy({
                by: ['siswaId'],
                _count: true,
            })
            .then((data) => data.length);

        const siswaTerbanyakSP = await this.prisma.suratPembinaan
            .groupBy({
                by: ['siswaId'],
                _count: { siswaId: true },
                orderBy: { _count: { siswaId: 'desc' } },
                take: 1,
            });

        if (siswaTerbanyakSP.length > 0) {
            const siswaDetail = await this.prisma.siswa.findUnique({
                where: { id: siswaTerbanyakSP[0].siswaId },
                select: { nama: true },
            });

            return {
                totalSiswa,
                totalSiswaKenaSP,
                siswaTerbanyakSP: siswaDetail
                    ? { nama: siswaDetail.nama, jumlahSP: siswaTerbanyakSP[0]._count.siswaId }
                    : null,
            };
        }

        return { totalSiswa, totalSiswaKenaSP, siswaTerbanyakSP: null };
    }

    async getDetailSP(siswaId: string) {
        return this.prisma.suratPembinaan.findMany({
            where: { siswaId },
            select: {
                id: true,
                keterangan: true,
                tanggal: true,
            },
            orderBy: { tanggal: "desc" },
        });
    }

}
