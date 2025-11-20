-- AlterTable
ALTER TABLE "tb_user" ALTER COLUMN "role" SET DEFAULT 'User';

-- CreateTable
CREATE TABLE "tb_refreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_refreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_refreshToken_token_key" ON "tb_refreshToken"("token");

-- AddForeignKey
ALTER TABLE "tb_refreshToken" ADD CONSTRAINT "tb_refreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
