-- AlterTable
ALTER TABLE "service" ADD COLUMN     "alertThresholdMinutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "maxCapacity" INTEGER;
