/*
  Warnings:

  - You are about to drop the `ReviewPhoto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReviewPhoto" DROP CONSTRAINT "ReviewPhoto_reviewId_fkey";

-- DropTable
DROP TABLE "ReviewPhoto";
