/*
  Warnings:

  - You are about to drop the column `organizationId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_organizationId_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "organizationId",
ALTER COLUMN "role" SET DEFAULT 'user';
