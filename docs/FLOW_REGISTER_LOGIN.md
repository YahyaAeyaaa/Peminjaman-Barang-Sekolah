# Flow Register & Login (Universal dengan Email)

## Overview

Sistem login universal menggunakan **Email + Password** untuk semua role (Admin, Petugas, Peminjam).

---

## 1. Flow Register (Siswa/Peminjam)

### Step-by-Step:

1. **Admin generate kode registrasi** → Halaman: `/admin/registration-codes/create`
   - Buat kode (contoh: `REG-2024-X1A`)
   - Set expire date & max usage
   - Bagikan kode ke siswa

2. **Siswa buka halaman register** → Halaman: `/register`
   - Masukkan kode registrasi
   - Klik "Verifikasi Kode"

3. **Kode valid → Form registrasi muncul**
   ```
   ┌─────────────────────────────────┐
   │ Kode: REG-2024-X1A ✅          │
   │                                  │
   │ Email: [___________] *          │
   │ First Name: [________] *        │
   │ Last Name: [________] *         │
   │ Password: [________] *           │
   │ Confirm Password: [____] *      │
   │                                  │
   │ [Register]                      │
   └─────────────────────────────────┘
   ```

4. **Validasi:**
   - ✅ Email format valid
   - ✅ Email belum terdaftar
   - ✅ Password minimal 6 karakter
   - ✅ Password match dengan confirm password
   - ✅ Kode registrasi valid & belum expire
   - ✅ Kode belum melewati max usage

5. **Submit → Create User:**
   - Role: `PEMINJAM` (auto)
   - Email: required
   - First Name: required
   - Last Name: required
   - Password: di-hash dengan bcrypt
   - Username: optional (bisa null)
   - Kelas, No HP, Alamat: optional (bisa diisi nanti di profile)

6. **Update kode registrasi:**
   - `used_count` bertambah
   - Jika `used_count >= max_usage` → status = `NONAKTIF`

7. **Redirect ke login** → "Registrasi berhasil, silakan login"

---

## 2. Flow Login (Universal untuk Semua Role)

### Step-by-Step:

1. **User buka halaman login** → Halaman: `/login`
   ```
   ┌─────────────────────────────────┐
   │ Email: [___________] *          │
   │ Password: [________] *           │
   │                                  │
   │ [Login]                         │
   └─────────────────────────────────┘
   ```

2. **Submit → Validasi:**
   - ✅ Email format valid
   - ✅ User exists dengan email tersebut
   - ✅ User `is_active` = true
   - ✅ Password valid

3. **Login berhasil → Redirect berdasarkan role:**
   - **Admin** → `/admin/dashboard`
   - **Petugas** → `/petugas/dashboard`
   - **Peminjam** → `/peminjam/dashboard`

---

## 3. API Endpoint: Register

### `POST /api/auth/register`

**Request Body:**
```json
{
  "code": "REG-2024-X1A",
  "email": "siswa@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "password123",
  "confirm_password": "password123"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil, silakan login",
  "data": {
    "id": "uuid-user",
    "email": "siswa@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "PEMINJAM"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Email sudah terdaftar"
}
```

**Validasi:**
- ✅ Email format valid
- ✅ Email belum terdaftar
- ✅ Password minimal 6 karakter
- ✅ Password match dengan confirm_password
- ✅ Kode registrasi valid
- ✅ Kode belum expire
- ✅ Kode belum melewati max usage

---

## 4. API Endpoint: Verify Registration Code

### `POST /api/auth/verify-code`

**Request Body:**
```json
{
  "code": "REG-2024-X1A"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "code": "REG-2024-X1A",
    "keterangan": "Untuk kelas X-1 A",
    "expire_date": "2024-01-25T00:00:00Z",
    "max_usage": 30,
    "used_count": 5,
    "status": "AKTIF"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Kode tidak valid atau sudah expire"
}
```

---

## 5. Struktur User Model (Updated)

```prisma
model User {
  id         String   @id @default(uuid())
  username   String?  @unique // Optional, untuk backward compatibility
  email      String   @unique // Required, untuk login
  password   String   // Hash dengan bcrypt
  role       UserRole @default(PEMINJAM)
  first_name String   // Required
  last_name  String   // Required
  kelas      String?  // Optional, bisa diisi di profile
  no_hp      String?  // Optional, bisa diisi di profile
  alamat     String?  // Optional, bisa diisi di profile
  is_active  Boolean  @default(true)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}
```

---

## 6. Flow Edit Profile

### Step-by-Step:

1. **User login** → Role: Admin/Petugas/Peminjam
2. **Buka halaman profile** → `/profile` atau `/dashboard/profile`
3. **Form edit profile:**
   ```
   ┌─────────────────────────────────┐
   │ Email: [readonly]               │
   │ First Name: [________] *        │
   │ Last Name: [________] *         │
   │ Kelas: [________] (optional)    │
   │ No HP: [________] (optional)    │
   │ Alamat: [________] (optional)   │
   │                                  │
   │ [Update Profile]                │
   └─────────────────────────────────┘
   ```

4. **Update data** → API: `PATCH /api/user/profile`
5. **Password bisa diubah terpisah** → `/profile/change-password`

---

## 7. Catatan Penting

### Register:
- ✅ Email + First Name + Last Name + Password (required)
- ✅ Kode registrasi (required)
- ✅ Kelas, No HP, Alamat (optional, bisa diisi nanti)

### Login:
- ✅ Email + Password (universal untuk semua role)
- ✅ Tidak perlu username
- ✅ Auto redirect berdasarkan role

### Profile:
- ✅ Email tidak bisa diubah (readonly)
- ✅ First Name, Last Name bisa diubah
- ✅ Kelas, No HP, Alamat bisa diisi/diubah
- ✅ Password bisa diubah terpisah

---

## 8. Default Credentials (Setelah Seed)

```
Admin:   email=admin@example.com, password=admin123
Petugas: email=petugas@example.com, password=admin123
Peminjam: email=peminjam@example.com, password=admin123
```

---

## 9. Next Steps

1. ✅ Update schema (done)
2. ✅ Update auth.js (done)
3. ✅ Update seed.js (done)
4. ⏳ Buat migration untuk update database
5. ⏳ Implementasi API register
6. ⏳ Implementasi API verify code
7. ⏳ Update halaman login (email instead of username)
8. ⏳ Buat halaman register
9. ⏳ Buat halaman profile/edit

