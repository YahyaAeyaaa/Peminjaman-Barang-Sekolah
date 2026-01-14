/*
  Warnings:

  - You are about to drop the column `nama` on the `users` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('MENUNGGU_PEMBAYARAN', 'DIKEMBALIKAN');

-- AlterTable
ALTER TABLE "returns" ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "denda_telat" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "status" "ReturnStatus" NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
ADD COLUMN     "total_denda" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "nama",
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "kelas" TEXT,
ADD COLUMN     "last_name" TEXT NOT NULL,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE INDEX "returns_status_idx" ON "returns"("status");
