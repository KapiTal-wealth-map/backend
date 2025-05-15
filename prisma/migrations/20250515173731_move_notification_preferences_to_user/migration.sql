/*
  Warnings:

  - You are about to drop the `NotificationPreference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NotificationPreference" DROP CONSTRAINT "NotificationPreference_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationPreferences" JSONB NOT NULL DEFAULT '{"email": true, "inApp": true}';

-- DropTable
DROP TABLE "NotificationPreference";
