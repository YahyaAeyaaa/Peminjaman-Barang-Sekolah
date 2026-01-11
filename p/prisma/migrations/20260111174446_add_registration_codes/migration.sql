-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('AKTIF', 'NONAKTIF', 'EXPIRED');

-- AlterEnum
ALTER TYPE "LoanStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "loans" ADD COLUMN     "batas_waktu_ambil" TIMESTAMP(3),
ADD COLUMN     "tanggal_ambil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "registration_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "keterangan" TEXT,
    "max_usage" INTEGER NOT NULL DEFAULT 0,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expire_date" TIMESTAMP(3),
    "status" "RegistrationStatus" NOT NULL DEFAULT 'AKTIF',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registration_codes_code_key" ON "registration_codes"("code");

-- CreateIndex
CREATE INDEX "registration_codes_code_idx" ON "registration_codes"("code");

-- CreateIndex
CREATE INDEX "registration_codes_status_idx" ON "registration_codes"("status");

-- CreateIndex
CREATE INDEX "registration_codes_expire_date_idx" ON "registration_codes"("expire_date");

-- CreateIndex
CREATE INDEX "registration_codes_created_by_idx" ON "registration_codes"("created_by");

-- AddForeignKey
ALTER TABLE "registration_codes" ADD CONSTRAINT "registration_codes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
