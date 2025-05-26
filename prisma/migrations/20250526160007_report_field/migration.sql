-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "error" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3);
