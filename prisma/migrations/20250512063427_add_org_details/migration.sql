-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "dataAccessSettings" JSONB DEFAULT '{}',
ADD COLUMN     "logo" TEXT;
