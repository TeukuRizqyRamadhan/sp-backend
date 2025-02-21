import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiswaService {
  constructor(private prisma: PrismaService) { }

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

  async buatSP(siswaId: string, jenisPelanggaran: string, keterangan: string) {
    try {
      const siswa = await this.prisma.siswa.findUnique({
        where: { id: siswaId },
      });
      if (!siswa) throw new Error('Siswa tidak ditemukan');

      // Buat SP baru
      const newSP = await this.prisma.suratPembinaan.create({
        data: { siswaId, jenisPelanggaran, keterangan },
      });

      // Update spCount di tabel siswa
      await this.prisma.siswa.update({
        where: { id: siswaId },
        data: { spCount: { increment: 1 } },
      });

      return newSP;
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
          select: { nama: true, kelas: true },
        });

        return {
          totalSiswa,
          totalSiswaKenaSP,
          siswaTerbanyakSP: siswaDetail
            ? {
              nama: siswaDetail.nama,
              kelas: siswaDetail.kelas,
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

  async getLeaderboardSP() {
    try {
      return await this.prisma.siswa.findMany({
        orderBy: { spCount: 'desc' },
        select: { id: true, nama: true, kelas: true, spCount: true },
        take: 5,
      });
    } catch (error) {
      throw new Error(`Error mendapatkan leaderboard SP: ${error.message}`);
    }
  }

  async getDetailSP(siswaId: string) {
    try {
      return await this.prisma.suratPembinaan.findMany({
        where: { siswaId },
        select: {
          id: true,
          jenisPelanggaran: true,
          keterangan: true,
          tanggal: true,
        },
        orderBy: { tanggal: 'desc' },
      });
    } catch (error) {
      throw new Error(`Error mendapatkan detail SP: ${error.message}`);
    }
  }

  async getAllSiswa(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const siswa = await this.prisma.siswa.findMany({
        skip,
        take: limit,
        orderBy: { nama: 'asc' },
      });

      const totalSiswa = await this.prisma.siswa.count();

      return {
        siswa,
        totalPages: Math.ceil(totalSiswa / limit),
      };
    } catch (error) {
      throw new Error(`Error mendapatkan daftar siswa: ${error.message}`);
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

  async getExportSP(filter: string, date: string) {
    try {
      let whereClause: any = {};

      if (!date || isNaN(Date.parse(date)) && filter !== 'tahun') {
        throw new BadRequestException('Tanggal tidak valid');
      }

      if (filter === 'hari') {
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        whereClause.tanggal = {
          gte: startDate,
          lt: endDate,
        };
      } else if (filter === 'bulan') {
        const startDate = new Date(`${date}-01`);
        if (isNaN(startDate.getTime())) {
          throw new BadRequestException('Format bulan tidak valid');
        }

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        whereClause.tanggal = {
          gte: startDate,
          lt: endDate,
        };
      } else if (filter === 'tahun') {
        const year = parseInt(date, 10);
        if (isNaN(year) || year < 2000 || year > 2100) {
          throw new BadRequestException('Tahun tidak valid');
        }

        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year + 1}-01-01`);

        whereClause.tanggal = {
          gte: startDate,
          lt: endDate,
        };
      } else {
        throw new BadRequestException('Filter tidak valid');
      }

      const results = await this.prisma.suratPembinaan.findMany({
        where: whereClause,
        select: {
          id: true,
          jenisPelanggaran: true,
          keterangan: true,
          tanggal: true,
          siswa: { select: { nama: true, spCount: true } },
        },
        orderBy: { tanggal: 'desc' },
      });

      // Ubah struktur data agar nama siswa berada di level atas
      return results.map((item) => ({
        ...item,
        nama: item.siswa?.nama || 'Tidak diketahui',
        spCount: item.siswa?.spCount || 0,
        siswa: undefined, // Hilangkan properti siswa agar lebih bersih
      }));
    } catch (error) {
      throw new Error(`Error mengekspor data SP: ${error.message}`);
    }
  }

}
