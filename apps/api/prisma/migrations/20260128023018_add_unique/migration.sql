/*
  Warnings:

  - A unique constraint covering the columns `[userId,serviceId]` on the table `service_staff` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "service_staff_userId_serviceId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "service_staff_userId_serviceId_key" ON "service_staff"("userId", "serviceId");
