# Roadmap Pengembangan Aplikasi Peminjaman Alat

## ✅ Yang Sudah Selesai

1. ✅ Database Schema (Prisma) - Lengkap
2. ✅ Migration Database - Selesai
3. ✅ Authentication (NextAuth) - Setup
4. ✅ Register/Login Flow - UI sudah ada
5. ✅ Middleware Protection - Sudah ada
6. ✅ Branch Protection - Sudah di-set di GitHub
7. ✅ Folder Structure - Dokumentasi sudah ada

---

## 🚀 Prioritas Pengembangan

### **Phase 1: API Endpoints (Backend First)** ⭐ PENTING

#### 1.1 Equipment Management API
- [ ] `GET /api/equipment` - List semua alat (dengan filter, search, pagination)
- [ ] `GET /api/equipment/[id]` - Detail alat
- [ ] `POST /api/equipment` - Create alat (Admin only)
- [ ] `PATCH /api/equipment/[id]` - Update alat (Admin only)
- [ ] `DELETE /api/equipment/[id]` - Delete alat (Admin only)

#### 1.2 Loan Management API
- [ ] `GET /api/loans` - List peminjaman (filter by user, status)
- [ ] `POST /api/loans` - Create peminjaman (Peminjam)
- [ ] `GET /api/loans/[id]` - Detail peminjaman
- [ ] `PATCH /api/loans/[id]/approve` - Approve peminjaman (Petugas/Admin)
- [ ] `PATCH /api/loans/[id]/reject` - Reject peminjaman (Petugas/Admin)
- [ ] `PATCH /api/loans/[id]/confirm-take` - Konfirmasi pengambilan (Petugas/Admin)

#### 1.3 Return Management API
- [ ] `POST /api/returns` - Create return (Peminjam)
- [ ] `GET /api/returns` - List returns (Petugas/Admin)
- [ ] `GET /api/returns/[id]` - Detail return

#### 1.4 Registration Code API
- [ ] `GET /api/registration-codes` - List kode (Admin only)
- [ ] `POST /api/registration-codes` - Generate kode baru (Admin only)
- [ ] `PATCH /api/registration-codes/[id]` - Update kode (Admin only)
- [ ] `POST /api/auth/register` - Register dengan validasi kode

#### 1.5 Category API
- [ ] `GET /api/categories` - List kategori
- [ ] `POST /api/categories` - Create kategori (Admin only)
- [ ] `PATCH /api/categories/[id]` - Update kategori (Admin only)
- [ ] `DELETE /api/categories/[id]` - Delete kategori (Admin only)

#### 1.6 User Management API
- [ ] `GET /api/users` - List users (Admin only)
- [ ] `POST /api/users` - Create user (Admin only - untuk Petugas)
- [ ] `PATCH /api/users/[id]` - Update user (Admin only)
- [ ] `DELETE /api/users/[id]` - Delete user (Admin only)

#### 1.7 Article API
- [ ] `GET /api/articles` - List artikel (public)
- [ ] `GET /api/articles/[id]` - Detail artikel (public)
- [ ] `POST /api/articles` - Create artikel (Admin only)
- [ ] `PATCH /api/articles/[id]` - Update artikel (Admin only)
- [ ] `DELETE /api/articles/[id]` - Delete artikel (Admin only)

---

### **Phase 2: UI untuk Peminjam** 👤

#### 2.1 Dashboard Peminjam
- [ ] `/peminjam` - Dashboard dengan statistik
- [ ] `/peminjam/layout.jsx` - Layout dengan sidebar

#### 2.2 Browse & Request Equipment
- [ ] `/peminjam/alat` - List alat tersedia (dengan search, filter kategori)
- [ ] `/peminjam/alat/[id]` - Detail alat
- [ ] `/peminjam/pinjam/[id]` - Form request peminjaman

#### 2.3 Loan Management
- [ ] `/peminjam/peminjaman` - List peminjaman user (status: PENDING, APPROVED, BORROWED, RETURNED)
- [ ] `/peminjam/peminjaman/[id]` - Detail peminjaman
- [ ] `/peminjam/kembalikan/[id]` - Form pengembalian (dengan hitung denda)

#### 2.4 Profile
- [ ] `/peminjam/profile` - Edit profile (first_name, last_name, kelas, no_hp, alamat)

---

### **Phase 3: UI untuk Petugas** 👨‍💼

#### 3.1 Dashboard Petugas
- [ ] `/petugas` - Dashboard dengan statistik
- [ ] `/petugas/layout.jsx` - Layout dengan sidebar

#### 3.2 Loan Approval
- [ ] `/petugas/peminjaman` - List peminjaman pending (dengan filter)
- [ ] `/petugas/peminjaman/[id]` - Detail peminjaman (approve/reject)
- [ ] `/petugas/peminjaman/[id]/confirm-take` - Konfirmasi pengambilan

#### 3.3 Return Management
- [ ] `/petugas/pengembalian` - List pengembalian
- [ ] `/petugas/pengembalian/[id]` - Detail pengembalian (terima return)

#### 3.4 Reports
- [ ] `/petugas/laporan` - Laporan peminjaman (filter by date, status)

---

### **Phase 4: UI untuk Admin** 👑

#### 4.1 Dashboard Admin
- [ ] `/admin` - Dashboard dengan statistik lengkap
- [ ] `/admin/layout.jsx` - Layout dengan sidebar

#### 4.2 User Management
- [ ] `/admin/users` - List semua users (dengan filter role)
- [ ] `/admin/users/create` - Form create Petugas
- [ ] `/admin/users/[id]` - Edit user

#### 4.3 Equipment Management
- [ ] `/admin/equipment` - List semua alat (CRUD)
- [ ] `/admin/equipment/create` - Form create alat
- [ ] `/admin/equipment/[id]` - Edit alat

#### 4.4 Category Management
- [ ] `/admin/categories` - List kategori (CRUD)
- [ ] `/admin/categories/create` - Form create kategori

#### 4.5 Article Management
- [ ] `/admin/articles` - List artikel (CRUD)
- [ ] `/admin/articles/create` - Form create artikel (dengan rich text editor)
- [ ] `/admin/articles/[id]` - Edit artikel

#### 4.6 Registration Code Management
- [ ] `/admin/registration-codes` - List kode registrasi
- [ ] `/admin/registration-codes/create` - Form generate kode

#### 4.7 Activity Logs
- [ ] `/admin/activity-logs` - List log aktivitas (dengan filter)

---

### **Phase 5: Testing & Polish** 🧪

#### 5.1 Testing
- [ ] Test login flow (Admin, Petugas, Peminjam)
- [ ] Test create loan flow
- [ ] Test approve/reject flow
- [ ] Test return flow dengan denda
- [ ] Test CRUD equipment
- [ ] Test user management

#### 5.2 UI/UX Improvements
- [ ] Loading states
- [ ] Error handling & messages
- [ ] Success notifications
- [ ] Responsive design
- [ ] Dark mode (optional)

#### 5.3 Performance
- [ ] Optimize queries (pagination, indexing)
- [ ] Image optimization
- [ ] Caching (jika perlu)

---

## 📋 Rekomendasi Urutan Pengerjaan

### **Sprint 1: Backend API (1-2 minggu)**
1. Equipment API (CRUD)
2. Loan API (create, approve, reject)
3. Return API
4. Registration Code API

### **Sprint 2: Peminjam UI (1 minggu)**
1. Dashboard & Layout
2. Browse Equipment
3. Request Loan
4. Track Loans & Return

### **Sprint 3: Petugas UI (1 minggu)**
1. Dashboard & Layout
2. Approve/Reject Loans
3. Manage Returns

### **Sprint 4: Admin UI (1-2 minggu)**
1. Dashboard & Layout
2. User Management
3. Equipment Management
4. Category Management
5. Article Management
6. Registration Code Management

### **Sprint 5: Testing & Polish (1 minggu)**
1. Testing semua flow
2. Bug fixes
3. UI/UX improvements

---

## 🎯 Quick Start: Mulai dari Mana?

**Rekomendasi: Mulai dari Equipment API** karena:
1. ✅ Relatif sederhana (CRUD)
2. ✅ Dibutuhkan untuk fitur lain (loan, return)
3. ✅ Bisa langsung test dengan Postman/Thunder Client

**Langkah berikutnya:**
1. Buat branch baru: `git checkout -b feature/equipment-api`
2. Implement `GET /api/equipment` dan `POST /api/equipment`
3. Test dengan Postman
4. Commit & push
5. Buat Pull Request ke main

---

## 📝 Catatan

- Setiap fitur dibuat di branch terpisah
- Setiap PR harus di-review sebelum merge ke main
- Test setiap API endpoint sebelum lanjut ke UI
- Dokumentasi API bisa dibuat di `docs/API.md`

