# Struktur Folder untuk 3 Role

## Rekomendasi Struktur Folder

```
app/
├── (auth)/                    # Group route untuk auth (optional grouping)
│   ├── login/
│   │   └── page.jsx           # Halaman login (universal)
│   └── register/
│       └── page.jsx           # Halaman register (untuk peminjam)
│
├── (dashboard)/               # Group route untuk dashboard (optional)
│   ├── dashboard/
│   │   └── page.jsx           # Dashboard universal (redirect ke role-specific)
│   │
│   ├── peminjam/              # Route untuk Peminjam/Siswa
│   │   ├── layout.jsx         # Layout khusus peminjam (sidebar, navbar)
│   │   ├── page.jsx           # Dashboard peminjam
│   │   ├── alat/
│   │   │   └── page.jsx       # Daftar alat tersedia
│   │   ├── pinjam/
│   │   │   └── [equipment_id]/
│   │   │       └── page.jsx   # Form pinjam alat
│   │   ├── peminjaman/
│   │   │   └── page.jsx       # Daftar peminjaman user
│   │   ├── kembalikan/
│   │   │   └── [loan_id]/
│   │   │       └── page.jsx   # Form kembalikan alat
│   │   └── profile/
│   │       └── page.jsx       # Profile peminjam (edit data)
│   │
│   ├── petugas/               # Route untuk Petugas
│   │   ├── layout.jsx         # Layout khusus petugas
│   │   ├── page.jsx           # Dashboard petugas
│   │   ├── peminjaman/
│   │   │   ├── page.jsx       # Daftar peminjaman (approve/reject)
│   │   │   └── [loan_id]/
│   │   │       ├── page.jsx   # Detail peminjaman
│   │   │       └── confirm-take/
│   │   │           └── page.jsx # Konfirmasi pengambilan barang
│   │   ├── pengembalian/
│   │   │   └── page.jsx       # Daftar pengembalian
│   │   ├── laporan/
│   │   │   └── page.jsx       # Laporan peminjaman
│   │   └── profile/
│   │       └── page.jsx       # Profile petugas
│   │
│   └── admin/                 # Route untuk Admin
│       ├── layout.jsx         # Layout khusus admin
│       ├── page.jsx           # Dashboard admin
│       ├── users/
│       │   ├── page.jsx       # Daftar user (CRUD)
│       │   ├── create/
│       │   │   └── page.jsx   # Buat user baru (Petugas)
│       │   └── [user_id]/
│       │       └── page.jsx   # Edit user
│       ├── equipment/
│       │   ├── page.jsx       # Daftar alat (CRUD)
│       │   ├── create/
│       │   │   └── page.jsx   # Buat alat baru
│       │   └── [equipment_id]/
│       │       └── page.jsx   # Edit alat
│       ├── categories/
│       │   ├── page.jsx       # Daftar kategori (CRUD)
│       │   └── create/
│       │       └── page.jsx   # Buat kategori baru
│       ├── peminjaman/
│       │   └── page.jsx       # Daftar semua peminjaman
│       ├── articles/
│       │   ├── page.jsx       # Daftar artikel
│       │   ├── create/
│       │   │   └── page.jsx   # Buat artikel baru
│       │   └── [article_id]/
│       │       └── page.jsx   # Edit artikel
│       ├── registration-codes/
│       │   ├── page.jsx       # Daftar kode registrasi
│       │   └── create/
│       │       └── page.jsx   # Buat kode registrasi
│       ├── activity-logs/
│       │   └── page.jsx       # Log aktivitas
│       └── profile/
│           └── page.jsx       # Profile admin
│
├── api/                       # API Routes
│   ├── auth/
│   │   ├── [...nextauth]/
│   │   │   └── route.js       # NextAuth handler
│   │   ├── register/
│   │   │   └── route.js       # POST /api/auth/register
│   │   └── login/
│   │       └── route.js       # POST /api/auth/login (optional)
│   │
│   ├── loans/
│   │   ├── route.js           # GET, POST /api/loans
│   │   └── [loan_id]/
│   │       ├── route.js       # GET, PATCH /api/loans/[id]
│   │       ├── approve/
│   │       │   └── route.js   # PATCH /api/loans/[id]/approve
│   │       ├── reject/
│   │       │   └── route.js   # PATCH /api/loans/[id]/reject
│   │       └── confirm-take/
│   │           └── route.js   # PATCH /api/loans/[id]/confirm-take
│   │
│   ├── returns/
│   │   └── route.js           # POST /api/returns
│   │
│   ├── equipment/
│   │   ├── route.js           # GET, POST /api/equipment
│   │   └── [equipment_id]/
│   │       └── route.js       # GET, PATCH, DELETE /api/equipment/[id]
│   │
│   ├── categories/
│   │   ├── route.js           # GET, POST /api/categories
│   │   └── [category_id]/
│   │       └── route.js       # GET, PATCH, DELETE /api/categories/[id]
│   │
│   ├── users/
│   │   ├── route.js           # GET, POST /api/users
│   │   └── [user_id]/
│   │       └── route.js       # GET, PATCH, DELETE /api/users/[id]
│   │
│   ├── articles/
│   │   ├── route.js           # GET, POST /api/articles
│   │   └── [article_id]/
│   │       └── route.js       # GET, PATCH, DELETE /api/articles/[id]
│   │
│   └── registration-codes/
│       ├── route.js           # GET, POST /api/registration-codes
│       └── [code_id]/
│           └── route.js       # GET, PATCH, DELETE /api/registration-codes/[id]
│
├── globals.css                # Global styles
├── layout.jsx                 # Root layout
└── page.jsx                   # Home page (landing page)
```

---

## Penjelasan Struktur

### 1. **Group Routes (Optional)**
- `(auth)` - Group untuk halaman auth (tidak mempengaruhi URL)
- `(dashboard)` - Group untuk dashboard (tidak mempengaruhi URL)

### 2. **Role-Specific Routes**
- `/peminjam/*` - Hanya bisa diakses oleh role PEMINJAM
- `/petugas/*` - Hanya bisa diakses oleh role PETUGAS (dan ADMIN)
- `/admin/*` - Hanya bisa diakses oleh role ADMIN

### 3. **Layout per Role**
- Setiap role punya `layout.jsx` sendiri untuk:
  - Sidebar navigation
  - Header/Navbar
  - Role-specific styling

### 4. **API Routes**
- Terorganisir per resource
- Mengikuti RESTful convention

---

## Contoh Layout per Role

### `/peminjam/layout.jsx`
```jsx
export default function PeminjamLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar role="peminjam" />
      <main className="flex-1">
        <Navbar />
        {children}
      </main>
    </div>
  )
}
```

### `/petugas/layout.jsx`
```jsx
export default function PetugasLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar role="petugas" />
      <main className="flex-1">
        <Navbar />
        {children}
      </main>
    </div>
  )
}
```

### `/admin/layout.jsx`
```jsx
export default function AdminLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar role="admin" />
      <main className="flex-1">
        <Navbar />
        {children}
      </main>
    </div>
  )
}
```

---

## Middleware Protection

Middleware sudah ada di `middleware.js` untuk:
- ✅ Protect routes berdasarkan role
- ✅ Redirect jika role tidak sesuai
- ✅ Redirect ke login jika belum login

---

## URL Structure

### Peminjam:
- `/peminjam` - Dashboard
- `/peminjam/alat` - Daftar alat
- `/peminjam/pinjam/[id]` - Form pinjam
- `/peminjam/peminjaman` - Daftar peminjaman
- `/peminjam/profile` - Profile

### Petugas:
- `/petugas` - Dashboard
- `/petugas/peminjaman` - Approve/Reject peminjaman
- `/petugas/pengembalian` - Monitor pengembalian
- `/petugas/laporan` - Laporan

### Admin:
- `/admin` - Dashboard
- `/admin/users` - CRUD User
- `/admin/equipment` - CRUD Equipment
- `/admin/categories` - CRUD Categories
- `/admin/articles` - CRUD Articles
- `/admin/registration-codes` - Manage kode registrasi
- `/admin/activity-logs` - Log aktivitas

---

## Next Steps

1. Buat folder structure
2. Buat layout untuk setiap role
3. Buat dashboard untuk setiap role
4. Implementasi halaman per fitur


