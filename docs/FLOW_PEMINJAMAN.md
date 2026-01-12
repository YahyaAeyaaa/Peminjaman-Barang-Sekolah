# Flow Peminjaman Alat

## Overview

Flow peminjaman untuk aplikasi sekolah (gratis, approval-based):

1. **Peminjam** mengajukan peminjaman → Status: `PENDING`
2. **Petugas** review & approve/reject → Status: `APPROVED` / `REJECTED`
3. Setelah approve → Status: `BORROWED` (alat bisa diambil)
4. **Peminjam** kembalikan alat → Status: `RETURNED`
5. Jika terlambat/rusak → Hitung denda

---

## 1. Flow Peminjam Mengajukan Peminjaman

### Step-by-Step:

1. **Peminjam login** → Role: `PEMINJAM`
2. **Lihat daftar alat** → Halaman: `/peminjam/alat`
   - Filter: hanya alat dengan `status = AVAILABLE` dan `stok > 0`
   - Tampilkan: nama, kategori, stok, gambar, deskripsi
3. **Pilih alat** → Klik tombol "Pinjam"
4. **Form peminjaman** → Halaman: `/peminjam/pinjam/[equipment_id]`
   - Input: jumlah (default: 1)
   - Input: tanggal deadline (batas waktu pengembalian)
   - Input: keterangan (optional)
5. **Submit** → API: `POST /api/loans`
6. **Validasi**:
   - Stok tersedia (stok >= jumlah)
   - Alat status = AVAILABLE
   - User sudah login (role = PEMINJAM)
7. **Create Loan** → Status: `PENDING`
8. **Notifikasi** → "Peminjaman berhasil diajukan, menunggu persetujuan"

---

## 2. API Endpoint: Create Loan

### `POST /api/loans`

**Request Body:**
```json
{
  "equipment_id": "uuid-equipment",
  "jumlah": 1,
  "tanggal_deadline": "2024-01-20T00:00:00Z",
  "keterangan": "Untuk praktikum"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-loan",
    "status": "PENDING",
    "equipment": {
      "nama": "Laptop Dell",
      "kategori": "Elektronik"
    },
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Stok tidak tersedia"
}
```

**Validasi:**
- ✅ User sudah login (role = PEMINJAM)
- ✅ Equipment exists & status = AVAILABLE
- ✅ Stok >= jumlah yang diminta
- ✅ Tanggal deadline > tanggal sekarang
- ✅ User tidak punya loan aktif untuk alat yang sama

---

## 3. Flow Petugas Approve/Reject

### Step-by-Step:

1. **Petugas login** → Role: `PETUGAS` atau `ADMIN`
2. **Lihat daftar peminjaman** → Halaman: `/petugas/peminjaman`
   - Filter: status = `PENDING`
   - Tampilkan: nama peminjam, alat, jumlah, tanggal pinjam, deadline
3. **Review peminjaman** → Klik "Detail"
4. **Approve atau Reject**:
   - **Approve**: 
     - Update status: `PENDING` → `APPROVED` (siap diambil, belum diambil)
     - Set `approved_by` = petugas ID
     - Set `approved_at` = sekarang
     - Set `batas_waktu_ambil` = sekarang + 3 hari (default)
     - **Stok BELUM dikurangi** (akan dikurangi saat konfirmasi ambil)
   - **Reject**:
     - Update status: `PENDING` → `REJECTED`
     - Set `rejected_by` = petugas ID
     - Input `rejection_reason` (wajib)

## 3.5. Flow Konfirmasi Pengambilan Barang

### Step-by-Step:

1. **Siswa** lihat peminjaman yang sudah `APPROVED` → Halaman: `/peminjam/peminjaman`
2. **Siswa** screenshot bukti approval (manual)
3. **Siswa** datang ke ruang/gudang industri dengan bukti
4. **Petugas** verifikasi bukti & serahkan barang
5. **Petugas** konfirmasi "Barang sudah diambil" → Halaman: `/petugas/peminjaman/[loan_id]/confirm-take`
   - Update status: `APPROVED` → `BORROWED`
   - Set `tanggal_ambil` = sekarang
   - Update stok: `stok = stok - jumlah`
6. **Sistem** cek batas waktu ambil (cron job atau saat load):
   - Jika `tanggal_sekarang > batas_waktu_ambil` dan status masih `APPROVED` → Auto-cancel: status = `EXPIRED`

---

## 4. API Endpoint: Approve/Reject Loan

### `PATCH /api/loans/[loan_id]/approve`

**Request Body:**
```json
{
  "action": "approve" // atau "reject",
  "batas_waktu_ambil": "2024-01-18T00:00:00Z" // optional, default: sekarang + 3 hari
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-loan",
    "status": "APPROVED",
    "approved_by": "petugas-id",
    "approved_at": "2024-01-15T11:00:00Z",
    "batas_waktu_ambil": "2024-01-18T00:00:00Z"
  }
}
```

### `PATCH /api/loans/[loan_id]/confirm-take`

**Request Body:**
```json
{}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-loan",
    "status": "BORROWED",
    "tanggal_ambil": "2024-01-16T10:00:00Z"
  }
}
```

**Validasi:**
- ✅ User sudah login (role = PETUGAS atau ADMIN)
- ✅ Loan status = APPROVED
- ✅ Stok masih >= jumlah (double check)

### `PATCH /api/loans/[loan_id]/reject`

**Request Body:**
```json
{
  "action": "reject",
  "rejection_reason": "Stok tidak mencukupi"
}
```

**Validasi:**
- ✅ User sudah login (role = PETUGAS atau ADMIN)
- ✅ Loan status = PENDING
- ✅ Jika reject, wajib isi rejection_reason

---

## 5. Flow Pengembalian Alat

### Step-by-Step:

1. **Peminjam login** → Role: `PEMINJAM`
2. **Lihat daftar peminjaman aktif** → Halaman: `/peminjam/peminjaman`
   - Filter: status = `BORROWED`
3. **Pilih peminjaman** → Klik "Kembalikan"
4. **Form pengembalian** → Halaman: `/peminjam/kembalikan/[loan_id]`
   - Input: kondisi alat (dropdown: BAIK, RUSAK_RINGAN, RUSAK_SEDANG, RUSAK_BERAT, HILANG)
   - Input: catatan (optional)
   - Upload: foto bukti (optional)
   - Tampilkan: denda telat (jika ada)
   - Tampilkan: denda kerusakan (auto-calculate)
5. **Submit** → API: `POST /api/returns`
6. **Validasi & Hitung Denda**:
   - Hitung denda telat (jika tanggal_kembali > tanggal_deadline)
   - Hitung denda kerusakan (harga_alat × persentase)
   - Total denda = denda telat + denda kerusakan
7. **Create Return** → Status loan: `RETURNED`
8. **Update stok** → `stok = stok + jumlah`

---

## 6. API Endpoint: Return Equipment

### `POST /api/returns`

**Request Body:**
```json
{
  "loan_id": "uuid-loan",
  "kondisi_alat": "RUSAK_RINGAN",
  "catatan": "Ada goresan kecil",
  "foto_bukti": "url-foto" // optional
}
```

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-return",
    "denda_telat": 50000,
    "denda_kerusakan": 150000,
    "total_denda": 200000,
    "status": "RETURNED"
  }
}
```

**Validasi:**
- ✅ User sudah login
- ✅ Loan status = BORROWED
- ✅ Loan belum pernah dikembalikan (return belum ada)
- ✅ Kondisi alat valid (enum)

---

## 7. Struktur Folder yang Perlu Dibuat

```
app/
├── api/
│   ├── loans/
│   │   ├── route.js              # GET (list), POST (create)
│   │   └── [loan_id]/
│   │       ├── route.js          # GET (detail), PATCH (update)
│   │       ├── approve/
│   │       │   └── route.js      # PATCH (approve)
│   │       └── reject/
│   │           └── route.js      # PATCH (reject)
│   └── returns/
│       └── route.js              # POST (create return)
├── peminjam/
│   ├── alat/
│   │   └── page.jsx              # Daftar alat tersedia
│   ├── pinjam/
│   │   └── [equipment_id]/
│   │       └── page.jsx          # Form pinjam alat
│   └── peminjaman/
│       └── page.jsx              # Daftar peminjaman user
└── petugas/
    └── peminjaman/
        └── page.jsx              # Daftar peminjaman (approve/reject)
```

---

## 8. Validasi Business Rules

### Saat Create Loan:
- ✅ Stok >= jumlah yang diminta
- ✅ Equipment status = AVAILABLE
- ✅ Tanggal deadline > tanggal sekarang
- ✅ User tidak punya loan aktif untuk alat yang sama (optional)

### Saat Approve:
- ✅ Stok masih >= jumlah (double check)
- ✅ Loan status = PENDING

### Saat Return:
- ✅ Loan status = BORROWED
- ✅ Hitung denda telat otomatis
- ✅ Hitung denda kerusakan berdasarkan kondisi

---

## 9. Perhitungan Denda

### Denda Telat:
```javascript
function hitungDendaTelat(tanggalDeadline, tanggalKembali, tarifPerHari = 5000) {
  const hariTerlambat = Math.ceil((tanggalKembali - tanggalDeadline) / (1000 * 60 * 60 * 24));
  if (hariTerlambat <= 0) return 0;
  return hariTerlambat * tarifPerHari;
}
```

### Denda Kerusakan:
```javascript
function hitungDendaKerusakan(kondisi, hargaAlat) {
  const persentase = {
    'BAIK': 0,
    'RUSAK_RINGAN': 0.15,  // 15%
    'RUSAK_SEDANG': 0.40,  // 40%
    'RUSAK_BERAT': 0.70,   // 70%
    'HILANG': 1.00         // 100%
  };
  return hargaAlat * persentase[kondisi];
}
```

---

## 10. Next Steps

1. ✅ Buat API endpoints
2. ✅ Buat halaman UI untuk Peminjam
3. ✅ Buat halaman UI untuk Petugas
4. ✅ Implementasi validasi
5. ✅ Testing

