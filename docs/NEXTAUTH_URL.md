# Penjelasan NEXTAUTH_URL

## Untuk Development (Local)

```env
NEXTAUTH_URL="http://localhost:3000"
```

**Ini sudah benar** jika:
- ✅ Next.js dev server berjalan di port **3000** (default)
- ✅ Anda mengakses aplikasi di browser dengan `http://localhost:3000`

---

## Jika Port Berbeda

Jika Next.js berjalan di port lain, sesuaikan:

```env
# Port 3001
NEXTAUTH_URL="http://localhost:3001"

# Port 8080
NEXTAUTH_URL="http://localhost:8080"
```

**Cara cek port:**
- Lihat di terminal saat menjalankan `npm run dev`
- Biasanya akan muncul: `- Local: http://localhost:3000`

---

## Untuk Production

Jika deploy ke production, ganti dengan domain yang sebenarnya:

```env
# Contoh untuk Vercel
NEXTAUTH_URL="https://nama-aplikasi.vercel.app"

# Contoh untuk domain sendiri
NEXTAUTH_URL="https://peminjaman-alat.com"
```

---

## Catatan Penting

1. **Harus match dengan URL aplikasi** - Jika aplikasi di `http://localhost:3000`, maka NEXTAUTH_URL juga harus `http://localhost:3000`

2. **Jangan pakai trailing slash** - Jangan pakai `http://localhost:3000/` (ada slash di akhir)

3. **Untuk development, http sudah cukup** - Tidak perlu https untuk local

4. **Untuk production, wajib https** - Pastikan pakai `https://` bukan `http://`

---

## Contoh Lengkap .env untuk Development

```env
DATABASE_URL="postgresql://postgres@localhost:5432/peminjaman_alat?schema=public"
NEXTAUTH_SECRET="secret-key-yang-sudah-di-generate"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Troubleshooting

**Error: "Invalid URL"**
- Pastikan format benar: `http://localhost:3000` (tanpa trailing slash)
- Pastikan tidak ada spasi

**Error: "Redirect URI mismatch"**
- Pastikan NEXTAUTH_URL sama dengan URL yang digunakan di browser
- Jika pakai port berbeda, update NEXTAUTH_URL


