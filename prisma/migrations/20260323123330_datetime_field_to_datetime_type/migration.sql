/*
  Warnings:

  - Changed the type of `datetime` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "datetime",
ADD COLUMN     "datetime" TIMESTAMP(3) NOT NULL;
