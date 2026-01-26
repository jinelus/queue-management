-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "service_staff" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
