-- CreateTable
CREATE TABLE "tb_accessToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_accessToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_accessToken_token_key" ON "tb_accessToken"("token");

-- AddForeignKey
ALTER TABLE "tb_accessToken" ADD CONSTRAINT "tb_accessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
