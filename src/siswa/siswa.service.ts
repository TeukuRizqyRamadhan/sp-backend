import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiswaService {
  constructor(private prisma: PrismaService) {}

  async searchSiswa(nama: string) {
    try {
      return await this.prisma.siswa.findMany({
        where: {
          nama: {
            contains: nama,
            mode: 'insensitive',
          },
        },
      });
    } catch (error) {
      throw new Error(`Error mencari siswa: ${error.message}`);
    }
  }

  async buatSP(siswaId: string, keterangan: string) {
    try {
      const siswa = await this.prisma.siswa.findUnique({
        where: { id: siswaId },
      });
      if (!siswa) throw new Error('Siswa tidak ditemukan');

      return await this.prisma.suratPembinaan.create({
        data: { siswaId, keterangan },
      });
    } catch (error) {
      throw new Error(`Error membuat SP: ${error.message}`);
    }
  }

  async countSP(siswaId: string) {
    try {
      return await this.prisma.suratPembinaan.count({
        where: { siswaId },
      });
    } catch (error) {
      throw new Error(`Error menghitung SP: ${error.message}`);
    }
  }

  async getStatistikSP() {
    try {
      const totalSiswa = await this.prisma.siswa.count();

      // Menghitung jumlah siswa yang memiliki SP unik
      const totalSiswaKenaSP = await this.prisma.suratPembinaan
        .groupBy({
          by: ['siswaId'],
          _count: true,
        })
        .then((data) => data.length);

      // Mencari siswa dengan jumlah SP terbanyak
      const siswaTerbanyakSP = await this.prisma.suratPembinaan.groupBy({
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
            ? {
                nama: siswaDetail.nama,
                jumlahSP: siswaTerbanyakSP[0]._count.siswaId,
              }
            : null,
        };
      }

      return { totalSiswa, totalSiswaKenaSP, siswaTerbanyakSP: null };
    } catch (error) {
      throw new Error(`Error mendapatkan statistik SP: ${error.message}`);
    }
  }

  async getDetailSP(siswaId: string) {
    try {
      return await this.prisma.suratPembinaan.findMany({
        where: { siswaId },
        select: {
          id: true,
          keterangan: true,
          tanggal: true,
        },
        orderBy: { tanggal: 'desc' },
      });
    } catch (error) {
      throw new Error(`Error mendapatkan detail SP: ${error.message}`);
    }
  }

  async uploadMassal(data: { nama: string; kelas: string }[]) {
    try {
      // Ambil daftar siswa yang sudah ada berdasarkan nama dan kelas
      const existingSiswa = new Set(
        (
          await this.prisma.siswa.findMany({
            where: {
              OR: data.map(({ nama, kelas }) => ({ nama, kelas })),
            },
            select: { nama: true, kelas: true },
          })
        ).map(({ nama, kelas }) => `${nama}-${kelas}`),
      );

      // Filter data yang belum ada di database
      const newData = data.filter(
        (siswa) => !existingSiswa.has(`${siswa.nama}-${siswa.kelas}`),
      );

      // Jika tidak ada data baru yang bisa diunggah, hentikan proses
      if (newData.length === 0) {
        throw new Error('Semua data siswa sudah ada di database.');
      }

      // Upload data yang belum ada
      return await this.prisma.siswa.createMany({
        data: newData,
        skipDuplicates: true,
      });
    } catch (error) {
      throw new Error(`Error upload data massal: ${error.message}`);
    }
  }
}
