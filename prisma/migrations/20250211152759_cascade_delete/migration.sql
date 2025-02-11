-- DropForeignKey
ALTER TABLE "SuratPembinaan" DROP CONSTRAINT "SuratPembinaan_siswaId_fkey";

-- AddForeignKey
ALTER TABLE "SuratPembinaan" ADD CONSTRAINT "SuratPembinaan_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
