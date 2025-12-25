/*
  Warnings:

  - A unique constraint covering the columns `[tokenId]` on the table `tb_accessToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tb_accessToken_token_key";

-- DropIndex
DROP INDEX "tb_refreshToken_token_key";

-- AlterTable
ALTER TABLE "tb_accessToken" ADD COLUMN     "tokenId" TEXT;

-- AlterTable
ALTER TABLE "tb_refreshToken" ADD COLUMN     "tokenId" TEXT;

-- CreateTable
CREATE TABLE "tb_otp" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_otp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_accessToken_tokenId_key" ON "tb_accessToken"("tokenId");
