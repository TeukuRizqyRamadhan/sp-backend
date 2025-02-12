import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common';
import { SiswaService } from './siswa.service';

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
  async countSP(@Query('id') siswaId: string) {
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
}
