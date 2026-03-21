-- CreateEnum
CREATE TYPE "Cadence" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "seriesId" TEXT;

-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cadence" "Cadence" NOT NULL,
    "location" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "churchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
