-- AlterTable
ALTER TABLE "service_staff" ADD COLUMN     "isCounterClosed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false;
