-- CreateEnum
CREATE TYPE "FoundStatus" AS ENUM ('PENDING', 'CLAIMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "tb_lostReport" (
    "id" SERIAL NOT NULL,
    "namaBarang" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasiHilang" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "LostStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "tb_lostReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_foundReports" (
    "id" SERIAL NOT NULL,
    "namaBarang" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasiTemu" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusFound" "FoundStatus" NOT NULL DEFAULT 'PENDING',
    "lostReportId" INTEGER,

    CONSTRAINT "tb_foundReports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_foundReports_lostReportId_key" ON "tb_foundReports"("lostReportId");

-- AddForeignKey
ALTER TABLE "tb_lostReport" ADD CONSTRAINT "tb_lostReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tb_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_foundReports" ADD CONSTRAINT "tb_foundReports_lostReportId_fkey" FOREIGN KEY ("lostReportId") REFERENCES "tb_lostReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
