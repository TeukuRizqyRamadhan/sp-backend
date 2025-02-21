import { Controller, Get, Post, Query, Body, Param, Res } from '@nestjs/common';
import { SiswaService } from './siswa.service';
import { Response } from 'express';
import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';

@Controller('siswa')
export class SiswaController {
  constructor(private readonly siswaService: SiswaService) { }

  @Get('search')
  async searchSiswa(@Query('nama') nama: string) {
    return this.siswaService.searchSiswa(nama);
  }

  @Get()
  async getAllSiswa(@Query('page') page = '1', @Query('limit') limit = '10') {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.siswaService.getAllSiswa(pageNumber, limitNumber);
  }

  @Post('sp')
  async buatSP(@Body() body: { siswaId: string; jenisPelanggaran: string; keterangan: string }) {
    return this.siswaService.buatSP(body.siswaId, body.jenisPelanggaran, body.keterangan);
  }

  @Get(':id/sp-count')
  async countSP(@Param('id') siswaId: string) {
    return this.siswaService.countSP(siswaId);
  }

  @Get('statistik-sp')
  async getStatistikSP() {
    return this.siswaService.getStatistikSP();
  }

  @Get(':id/detail-sp')
  async getDetailSP(@Param('id') siswaId: string) {
    return this.siswaService.getDetailSP(siswaId);
  }

  @Post('upload-massal')
  async uploadMassal(@Body() body: { data: { nama: string; kelas: string }[] }) {
    return this.siswaService.uploadMassal(body.data);
  }

  @Get('leaderboard-sp')
  async getLeaderboardSP() {
    return this.siswaService.getLeaderboardSP();
  }

  @Get('export-sp')
  async exportSP(@Query('filter') filter: string, @Query('date') date: string, @Res() res: Response) {
    try {
      const data = await this.siswaService.getExportSP(filter, date);

      if (!data || data.length === 0) {
        return res.status(404).send('Tidak ada data yang tersedia.');
      }

      const orderedData = data.map((item, index) => ({
        no: index + 1, // Tambahkan nomor urut mulai dari 1
        nama: item.nama,
        jenisPelanggaran: item.jenisPelanggaran,
        keterangan: item.keterangan,
        totalsp: item.spCount,
        tanggal: item.tanggal
      }));

      const fields = ["no", "nama", "jenisPelanggaran", "keterangan", "totalsp", "tanggal"]; // Tentukan urutan kolom
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(orderedData);

      res.header('Content-Type', 'text/csv');
      res.attachment('export_sp.csv');
      res.send(csv);
    } catch (error) {
      console.error('Error saat ekspor SP:', error);
      res.status(500).send('Terjadi kesalahan pada server.');
    }
  }

  @Get('export-excel')
  async exportExcel(@Query('filter') filter: string, @Query('date') date: string, @Res() res: Response) {
    try {
      const data = await this.siswaService.getExportSP(filter, date);

      if (!data || data.length === 0) {
        return res.status(404).send('Tidak ada data yang tersedia.');
      }

      const orderedData = data.map((item, index) => ({
        no: index + 1,
        nama: item.nama,
        jenisPelanggaran: item.jenisPelanggaran,
        keterangan: item.keterangan,
        totalsp: item.spCount,
        tanggal: item.tanggal
      }));

      // Membuat worksheet dari data
      const worksheet = XLSX.utils.json_to_sheet(orderedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data SP');

      // Mengatur header untuk file Excel
      res.setHeader('Content-Disposition', 'attachment; filename=export_sp.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Mengirim file Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      res.send(excelBuffer);
    } catch (error) {
      console.error('Error saat ekspor SP ke Excel:', error);
      res.status(500).send('Terjadi kesalahan pada server.');
    }
  }

}
