/*
  Warnings:

  - You are about to drop the column `createdAt` on the `SuratPembinaan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SuratPembinaan" DROP COLUMN "createdAt",
ADD COLUMN     "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
