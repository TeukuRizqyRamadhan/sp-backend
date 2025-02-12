/*
  Warnings:

  - Added the required column `jenisPelanggaran` to the `SuratPembinaan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SuratPembinaan" ADD COLUMN     "jenisPelanggaran" TEXT NOT NULL;
