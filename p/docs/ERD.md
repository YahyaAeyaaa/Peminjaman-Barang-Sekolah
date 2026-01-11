# Entity Relationship Diagram (ERD)
## Aplikasi Peminjaman Alat

### Deskripsi
ERD ini menggambarkan struktur database untuk aplikasi peminjaman alat dengan 3 level pengguna: Admin, Petugas, dan Peminjam.

---

## Entity dan Atribut

### 1. **User** (Pengguna)
Tabel untuk menyimpan data pengguna sistem.

| Atribut | Tipe Data | Keterangan |
|---------|-----------|------------|
| id | UUID (PK) | Primary key, auto-generated |
| username | String (UNIQUE) | Username untuk login |
| password | String | Password yang di-hash dengan bcrypt |
| role | Enum | ADMIN, PETUGAS, atau PEMINJAM |
| nama | String | Nama lengkap pengguna |
| email | String (UNIQUE, Optional) | Email pengguna |
| created_at | DateTime | Timestamp pembuatan |
| updated_at | DateTime | Timestamp update terakhir |

**Relasi:**
- One-to-Many dengan `Loan` (satu user bisa punya banyak peminjaman)
- One-to-Many dengan `ActivityLog` (satu user bisa punya banyak log aktivitas)

---

### 2. **Category** (Kategori)
Tabel untuk menyimpan kategori alat.

| Atribut | Tipe Data | Keterangan |
|---------|-----------|------------|
| id | UUID (PK) | Primary key, auto-generated |
| nama | String (UNIQUE) | Nama kategori |
| deskripsi | String (Optional) | Deskripsi kategori |
| created_at | DateTime | Timestamp pembuatan |
| updated_at | DateTime | Timestamp update terakhir |

**Relasi:**
- One-to-Many dengan `Equipment` (satu kategori bisa punya banyak alat)

---

### 3. **Equipment** (Alat)
Tabel untuk menyimpan data alat yang bisa dipinjam.

| Atribut | Tipe Data | Keterangan |
|---------|-----------|------------|
| id | UUID (PK) | Primary key, auto-generated |
| nama | String | Nama alat |
| kategori_id | UUID (FK) | Foreign key ke Category |
| stok | Integer | Jumlah stok tersedia |
| status | Enum | AVAILABLE, UNAVAILABLE, MAINTENANCE |
| deskripsi | String (Optional) | Deskripsi alat |
| created_at | DateTime | Timestamp pembuatan |
| updated_at | DateTime | Timestamp update terakhir |

**Relasi:**
- Many-to-One dengan `Category` (banyak alat punya satu kategori)
- One-to-Many dengan `Loan` (satu alat bisa dipinjam berkali-kali)

---

### 4. **Loan** (Peminjaman)
Tabel untuk menyimpan data peminjaman alat.

| Atribut | Tipe Data | Keterangan |
|---------|-----------|------------|
| id | UUID (PK) | Primary key, auto-generated |
| user_id | UUID (FK) | Foreign key ke User (peminjam) |
| equipment_id | UUID (FK) | Foreign key ke Equipment |
| tanggal_pinjam | DateTime | Tanggal peminjaman |
| tanggal_kembali | DateTime (Optional) | Tanggal pengembalian aktual |
| tanggal_deadline | DateTime | Batas waktu pengembalian |
| status | Enum | PENDING, APPROVED, REJECTED, BORROWED, RETURNED, OVERDUE |
| denda | Decimal(10,2) | Jumlah denda jika terlambat |
| keterangan | String (Optional) | Keterangan tambahan |
| created_at | DateTime | Timestamp pembuatan |
| updated_at | DateTime | Timestamp update terakhir |

**Relasi:**
- Many-to-One dengan `User` (banyak peminjaman dari satu user)
- Many-to-One dengan `Equipment` (banyak peminjaman untuk satu alat)

---

### 5. **ActivityLog** (Log Aktivitas)
Tabel untuk menyimpan log aktivitas sistem (khusus Admin).

| Atribut | Tipe Data | Keterangan |
|---------|-----------|------------|
| id | UUID (PK) | Primary key, auto-generated |
| user_id | UUID (FK) | Foreign key ke User (yang melakukan aksi) |
| action | String | CREATE, UPDATE, DELETE, dll |
| table_name | String | Nama tabel yang diubah |
| record_id | String | ID record yang diubah |
| old_data | JSON (Optional) | Data lama sebelum perubahan |
| new_data | JSON (Optional) | Data baru setelah perubahan |
| ip_address | String (Optional) | IP address pengguna |
| user_agent | String (Optional) | User agent browser |
| created_at | DateTime | Timestamp aktivitas |

**Relasi:**
- Many-to-One dengan `User` (banyak log dari satu user)

**Index:**
- user_id (untuk query cepat berdasarkan user)
- table_name (untuk query cepat berdasarkan tabel)
- created_at (untuk sorting berdasarkan waktu)

---

## Diagram Relasi

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │◄─────┐
│ username    │      │
│ password    │      │
│ role        │      │
│ nama        │      │
│ email       │      │
└─────────────┘      │
                     │
                     │
┌─────────────┐      │      ┌─────────────┐
│    Loan     │      │      │ActivityLog  │
│─────────────│      │      │─────────────│
│ id (PK)     │      │      │ id (PK)     │
│ user_id(FK) │──────┘      │ user_id(FK) │──────┐
│ equipment_id│             │ action      │      │
│ tanggal_... │             │ table_name  │      │
│ status      │             │ record_id   │      │
│ denda       │             │ old_data    │      │
└─────────────┘             │ new_data    │      │
       │                    └─────────────┘      │
       │                                         │
       │                                         │
       │                    ┌─────────────┐    │
       │                    │  Equipment  │    │
       │                    │─────────────│    │
       └────────────────────│ id (PK)     │    │
                            │ kategori_id │    │
                            │ nama        │    │
                            │ stok        │    │
                            │ status      │    │
                            └─────────────┘    │
                                   │           │
                                   │           │
                            ┌─────────────┐   │
                            │  Category   │   │
                            │─────────────│   │
                            │ id (PK)     │   │
                            │ nama        │   │
                            │ deskripsi   │   │
                            └─────────────┘   │
                                              │
                                              │
                            ┌─────────────────┘
                            │
                            │ (User melakukan aksi pada tabel)
                            │
```

---

## Enum Values

### UserRole
- `ADMIN` - Administrator (full access)
- `PETUGAS` - Petugas/Staff (approval & monitoring)
- `PEMINJAM` - Peminjam/Borrower (request & return)

### EquipmentStatus
- `AVAILABLE` - Tersedia untuk dipinjam
- `UNAVAILABLE` - Tidak tersedia
- `MAINTENANCE` - Sedang dalam perawatan

### LoanStatus
- `PENDING` - Menunggu persetujuan
- `APPROVED` - Disetujui oleh petugas
- `REJECTED` - Ditolak
- `BORROWED` - Sedang dipinjam
- `RETURNED` - Sudah dikembalikan
- `OVERDUE` - Terlambat mengembalikan

---

## Constraints dan Rules

1. **Foreign Key Constraints:**
   - `Equipment.kategori_id` → `Category.id` (ON DELETE RESTRICT)
   - `Loan.user_id` → `User.id` (ON DELETE RESTRICT)
   - `Loan.equipment_id` → `Equipment.id` (ON DELETE RESTRICT)
   - `ActivityLog.user_id` → `User.id` (ON DELETE CASCADE)

2. **Unique Constraints:**
   - `User.username` (UNIQUE)
   - `User.email` (UNIQUE, optional)
   - `Category.nama` (UNIQUE)

3. **Default Values:**
   - `User.role` = `PEMINJAM`
   - `Equipment.stok` = 0
   - `Equipment.status` = `AVAILABLE`
   - `Loan.status` = `PENDING`
   - `Loan.denda` = 0

---

## Business Rules

1. **Peminjaman:**
   - User hanya bisa meminjam jika stok > 0
   - Status peminjaman dimulai dari `PENDING`
   - Setelah disetujui, status menjadi `APPROVED` → `BORROWED`
   - Jika melewati `tanggal_deadline`, status menjadi `OVERDUE`

2. **Pengembalian:**
   - Setelah dikembalikan, status menjadi `RETURNED`
   - Denda dihitung jika `tanggal_kembali` > `tanggal_deadline`
   - Stok equipment akan bertambah setelah pengembalian

3. **Activity Log:**
   - Hanya Admin yang bisa melihat log
   - Setiap perubahan data (CREATE, UPDATE, DELETE) dicatat
   - Menyimpan data lama dan baru untuk audit trail

