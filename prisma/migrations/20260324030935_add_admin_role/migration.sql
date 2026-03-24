-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- CreateTable
CREATE TABLE "ChurchAdmin" (
    "userId" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChurchAdmin_pkey" PRIMARY KEY ("userId","churchId")
);

-- AddForeignKey
ALTER TABLE "ChurchAdmin" ADD CONSTRAINT "ChurchAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchAdmin" ADD CONSTRAINT "ChurchAdmin_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
