-- AlterTable
ALTER TABLE "tb_foundReports" ADD COLUMN     "adminId" INTEGER;

-- AddForeignKey
ALTER TABLE "tb_foundReports" ADD CONSTRAINT "tb_foundReports_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "tb_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
