# Setup Database PostgreSQL

## 1. Persiapan Database

### Install PostgreSQL
Pastikan PostgreSQL sudah terinstall di sistem Anda. Jika belum, download dari: https://www.postgresql.org/download/

### Buat Database
Buka pgAdmin atau psql, lalu buat database baru:

```sql
CREATE DATABASE peminjaman_alat;
```

## 2. Konfigurasi Environment

Buat file `.env` di root project dengan isi:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/peminjaman_alat?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-minimal-32-characters"
NEXTAUTH_URL="http://localhost:3000"
```

**Catatan:**
- Ganti `username` dan `password` dengan kredensial PostgreSQL Anda
- Generate `NEXTAUTH_SECRET` yang aman (bisa pakai: `openssl rand -base64 32`)

## 3. Generate Prisma Client

```bash
npx prisma generate
```

## 4. Migrate Database

Jalankan migration untuk membuat tabel di database:

```bash
npx prisma migrate dev --name init
```

Atau jika ingin membuat migration manual:

```bash
npx prisma migrate dev --create-only --name init
npx prisma migrate deploy
```

## 5. Seed Database (Optional)

Buat file `prisma/seed.js` untuk data awal:

```javascript
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  // Create Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      nama: 'Administrator',
      email: 'admin@example.com'
    }
  })

  // Create Petugas
  const petugas = await prisma.user.upsert({
    where: { username: 'petugas' },
    update: {},
    create: {
      username: 'petugas',
      password: hashedPassword,
      role: 'PETUGAS',
      nama: 'Petugas 1',
      email: 'petugas@example.com'
    }
  })

  // Create Peminjam
  const peminjam = await prisma.user.upsert({
    where: { username: 'peminjam' },
    update: {},
    create: {
      username: 'peminjam',
      password: hashedPassword,
      role: 'PEMINJAM',
      nama: 'Peminjam 1',
      email: 'peminjam@example.com'
    }
  })

  // Create Categories
  const kategori1 = await prisma.category.create({
    data: {
      nama: 'Elektronik',
      deskripsi: 'Alat-alat elektronik'
    }
  })

  const kategori2 = await prisma.category.create({
    data: {
      nama: 'Perkakas',
      deskripsi: 'Alat-alat perkakas'
    }
  })

  console.log({ admin, petugas, peminjam, kategori1, kategori2 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Tambahkan script di `package.json`:

```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

Jalankan seed:

```bash
npx prisma db seed
```

## 6. Stored Procedures, Functions, dan Triggers

### Function: Hitung Denda
```sql
CREATE OR REPLACE FUNCTION hitung_denda(
  p_tanggal_deadline TIMESTAMP,
  p_tanggal_kembali TIMESTAMP,
  p_tarif_per_hari DECIMAL DEFAULT 5000
)
RETURNS DECIMAL AS $$
DECLARE
  v_hari_terlambat INTEGER;
  v_denda DECIMAL;
BEGIN
  -- Hitung hari terlambat
  v_hari_terlambat := EXTRACT(DAY FROM (p_tanggal_kembali - p_tanggal_deadline));
  
  -- Jika tidak terlambat, denda = 0
  IF v_hari_terlambat <= 0 THEN
    RETURN 0;
  END IF;
  
  -- Hitung denda
  v_denda := v_hari_terlambat * p_tarif_per_hari;
  
  RETURN v_denda;
END;
$$ LANGUAGE plpgsql;
```

### Function: Update Stok Equipment
```sql
CREATE OR REPLACE FUNCTION update_stok_equipment()
RETURNS TRIGGER AS $$
BEGIN
  -- Ketika peminjaman disetujui (status = BORROWED), kurangi stok
  IF NEW.status = 'BORROWED' AND OLD.status != 'BORROWED' THEN
    UPDATE equipment 
    SET stok = stok - 1 
    WHERE id = NEW.equipment_id;
  END IF;
  
  -- Ketika dikembalikan (status = RETURNED), tambah stok
  IF NEW.status = 'RETURNED' AND OLD.status != 'RETURNED' THEN
    UPDATE equipment 
    SET stok = stok + 1 
    WHERE id = NEW.equipment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Trigger: Auto Update Stok
```sql
CREATE TRIGGER trigger_update_stok
  AFTER UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_stok_equipment();
```

### Trigger: Auto Hitung Denda
```sql
CREATE OR REPLACE FUNCTION auto_hitung_denda()
RETURNS TRIGGER AS $$
BEGIN
  -- Jika status RETURNED dan ada tanggal_kembali
  IF NEW.status = 'RETURNED' AND NEW.tanggal_kembali IS NOT NULL THEN
    NEW.denda := hitung_denda(NEW.tanggal_deadline, NEW.tanggal_kembali);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_denda
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION auto_hitung_denda();
```

### Stored Procedure: Log Activity
```sql
CREATE OR REPLACE PROCEDURE log_activity(
  p_user_id UUID,
  p_action VARCHAR,
  p_table_name VARCHAR,
  p_record_id VARCHAR,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_ip_address VARCHAR DEFAULT NULL,
  p_user_agent VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO activity_logs (
    user_id, action, table_name, record_id, 
    old_data, new_data, ip_address, user_agent, created_at
  ) VALUES (
    p_user_id, p_action, p_table_name, p_record_id,
    p_old_data, p_new_data, p_ip_address, p_user_agent, NOW()
  );
END;
$$;
```

## 7. Commit dan Rollback

### Contoh Transaction dengan Commit
```sql
BEGIN;

-- Insert data
INSERT INTO equipment (nama, kategori_id, stok, status) 
VALUES ('Laptop', 'kategori-id', 5, 'AVAILABLE');

-- Commit jika berhasil
COMMIT;
```

### Contoh Transaction dengan Rollback
```sql
BEGIN;

-- Update data
UPDATE equipment SET stok = stok - 1 WHERE id = 'equipment-id';

-- Jika terjadi error, rollback
ROLLBACK;
```

## 8. Verifikasi Setup

Cek apakah semua tabel sudah dibuat:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Cek apakah functions sudah dibuat:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

Cek apakah triggers sudah dibuat:

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## 9. Backup Database

```bash
pg_dump -U username -d peminjaman_alat > backup.sql
```

## 10. Restore Database

```bash
psql -U username -d peminjaman_alat < backup.sql
```

