/*
  Warnings:

  - The primary key for the `PasswordResetToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PasswordResetToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `PasswordResetToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "webirata"."PasswordResetToken_email_token_key";

-- DropIndex
DROP INDEX "webirata"."PasswordResetToken_token_key";

-- AlterTable
ALTER TABLE "webirata"."PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_key" ON "webirata"."PasswordResetToken"("email");
