/*
  Warnings:

  - The values [shared] on the enum `SavedViewScope` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `SavedViewShare` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SavedViewScope_new" AS ENUM ('private', 'company');
ALTER TABLE "SavedMapView" ALTER COLUMN "scope" DROP DEFAULT;
ALTER TABLE "SavedMapView" ALTER COLUMN "scope" TYPE "SavedViewScope_new" USING ("scope"::text::"SavedViewScope_new");
ALTER TYPE "SavedViewScope" RENAME TO "SavedViewScope_old";
ALTER TYPE "SavedViewScope_new" RENAME TO "SavedViewScope";
DROP TYPE "SavedViewScope_old";
ALTER TABLE "SavedMapView" ALTER COLUMN "scope" SET DEFAULT 'private';
COMMIT;

-- DropForeignKey
ALTER TABLE "SavedViewShare" DROP CONSTRAINT "SavedViewShare_savedMapViewId_fkey";

-- DropForeignKey
ALTER TABLE "SavedViewShare" DROP CONSTRAINT "SavedViewShare_userId_fkey";

-- DropTable
DROP TABLE "SavedViewShare";
