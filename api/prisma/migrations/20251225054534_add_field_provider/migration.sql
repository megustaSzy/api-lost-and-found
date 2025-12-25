-- AlterTable
ALTER TABLE "tb_user" ADD COLUMN     "provider" TEXT DEFAULT 'local',
ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "notelp" DROP NOT NULL;
