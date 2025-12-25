/*
  Warnings:

  - A unique constraint covering the columns `[tokenId]` on the table `tb_refreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tb_refreshToken_tokenId_key" ON "tb_refreshToken"("tokenId");
