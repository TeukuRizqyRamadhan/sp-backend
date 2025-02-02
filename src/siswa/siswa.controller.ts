import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common';
import { SiswaService } from './siswa.service';

@Controller('siswa')
export class SiswaController {
    constructor(private readonly siswaService: SiswaService) { }

    @Get('search')
    async searchSiswa(@Query('nama') nama: string) {
        return this.siswaService.searchSiswa(nama);
    }

    @Post('sp')
    async buatSP(@Body() body: { siswaId: string; keterangan: string }) {
        return this.siswaService.buatSP(body.siswaId, body.keterangan);
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

}
