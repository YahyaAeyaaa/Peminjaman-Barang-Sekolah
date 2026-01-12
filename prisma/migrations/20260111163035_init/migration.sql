-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PETUGAS', 'PEMINJAM');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'BORROWED', 'RETURNED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ReturnCondition" AS ENUM ('BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'HILANG');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PEMINJAM',
    "nama" TEXT NOT NULL,
    "email" TEXT,
    "no_hp" TEXT,
    "alamat" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode_alat" TEXT,
    "kategori_id" TEXT NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "gambar" TEXT,
    "harga_sewa" DECIMAL(10,2),
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "tanggal_pinjam" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_kembali" TIMESTAMP(3),
    "tanggal_deadline" TIMESTAMP(3) NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "denda" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "keterangan" TEXT,
    "approved_by" TEXT,
    "rejected_by" TEXT,
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "returns" (
    "id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "returned_by" TEXT NOT NULL,
    "received_by" TEXT,
    "tanggal_kembali" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kondisi_alat" "ReturnCondition" NOT NULL,
    "catatan" TEXT,
    "foto_bukti" TEXT,
    "denda_dibayar" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_nama_key" ON "categories"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_kode_alat_key" ON "equipment"("kode_alat");

-- CreateIndex
CREATE INDEX "equipment_kategori_id_status_idx" ON "equipment"("kategori_id", "status");

-- CreateIndex
CREATE INDEX "equipment_status_stok_idx" ON "equipment"("status", "stok");

-- CreateIndex
CREATE INDEX "loans_user_id_status_idx" ON "loans"("user_id", "status");

-- CreateIndex
CREATE INDEX "loans_equipment_id_status_idx" ON "loans"("equipment_id", "status");

-- CreateIndex
CREATE INDEX "loans_status_tanggal_pinjam_idx" ON "loans"("status", "tanggal_pinjam");

-- CreateIndex
CREATE INDEX "loans_tanggal_deadline_idx" ON "loans"("tanggal_deadline");

-- CreateIndex
CREATE INDEX "loans_approved_by_idx" ON "loans"("approved_by");

-- CreateIndex
CREATE UNIQUE INDEX "returns_loan_id_key" ON "returns"("loan_id");

-- CreateIndex
CREATE INDEX "returns_loan_id_idx" ON "returns"("loan_id");

-- CreateIndex
CREATE INDEX "returns_returned_by_idx" ON "returns"("returned_by");

-- CreateIndex
CREATE INDEX "returns_received_by_idx" ON "returns"("received_by");

-- CreateIndex
CREATE INDEX "returns_tanggal_kembali_idx" ON "returns"("tanggal_kembali");

-- CreateIndex
CREATE INDEX "returns_kondisi_alat_idx" ON "returns"("kondisi_alat");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_table_name_idx" ON "activity_logs"("table_name");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_returned_by_fkey" FOREIGN KEY ("returned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
