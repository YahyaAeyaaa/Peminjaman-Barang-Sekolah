# Solusi: Merge PR Tanpa Approval (Opsi Bypass Tidak Ada)

## 🔴 Masalah

Opsi **"Allow specified actors to bypass required pull requests"** tidak muncul di settings.

Ini bisa karena:
- Fitur ini hanya ada di GitHub Enterprise/Pro
- Atau ada di tempat lain
- Atau tidak tersedia untuk plan gratis

---

## ✅ Solusi Alternatif

### **Opsi 1: Nonaktifkan Protection Sementara (PALING MUDAH)**

**Langkah:**
1. Settings → Branches → Edit rule `main`
2. **Uncheck** "Require a pull request before merging"
3. **Save changes**
4. Kembali ke PR → Klik **"Merge pull request"** (sekarang bisa!)
5. Setelah merge, **aktifkan kembali** protection:
   - Check kembali "Require a pull request before merging"
   - Save

**Keuntungan:**
- ✅ Cepat dan mudah
- ✅ Langsung bisa merge
- ✅ Protection bisa diaktifkan kembali

**Kekurangan:**
- ⚠️ Sementara protection nonaktif (tapi cuma sebentar)

---

### **Opsi 2: Merge via Command Line (Bypass Protection)**

Jika kamu punya akses admin, bisa merge langsung:

```bash
# Di local
git checkout main
git pull origin main
git merge fix/update-config
git push origin main
```

Tapi ini akan **ditolak** jika protection aktif.

**Solusi:** Nonaktifkan protection dulu, push, lalu aktifkan kembali.

---

### **Opsi 3: Buat Branch Lain untuk Approve (Workaround)**

1. Buat branch baru dari `fix/update-config`:
   ```bash
   git checkout fix/update-config
   git checkout -b fix/update-config-review
   git push -u origin fix/update-config-review
   ```

2. Buat PR dari `fix/update-config-review` → `main`
3. Approve PR pertama (`fix/update-config` → `main`) dari akun lain (jika ada)
4. Atau merge PR kedua

**Tapi ini ribet dan tidak praktis.**

---

### **Opsi 4: Cek di Tempat Lain**

Coba cek:
1. Settings → **General** → **Features** → Ada opsi bypass?
2. Settings → **Actions** → **General** → Ada opsi bypass?
3. Atau cek di **Organization settings** (jika pakai org)

Tapi kemungkinan besar tidak ada untuk plan gratis.

---

## 🎯 Rekomendasi: Opsi 1 (Nonaktifkan Sementara)

**Ini cara paling praktis untuk project sendiri:**

### **Langkah Detail:**

1. **Nonaktifkan Protection:**
   - Settings → Branches → Edit `main`
   - **Uncheck** "Require a pull request before merging"
   - **Save changes**

2. **Merge PR:**
   - Kembali ke halaman PR
   - Klik **"Merge pull request"**
   - Pilih merge type: **"Create a merge commit"**
   - Klik **"Confirm merge"**
   - ✅ Selesai!

3. **Aktifkan Kembali Protection:**
   - Settings → Branches → Edit `main`
   - **Check** "Require a pull request before merging"
   - Set **Required approvals: 1**
   - **Save changes**

**Total waktu: < 2 menit**

---

## 💡 Tips untuk Kedepan

### **Workflow yang Lebih Praktis:**

Karena opsi bypass tidak ada, untuk project sendiri bisa:

1. **Tetap pakai PR** untuk discipline dan history
2. **Tapi nonaktifkan "Require approvals"** (biarkan "Require PR" tetap aktif)
   - Settings → Branches → Edit `main`
   - Check: "Require a pull request before merging"
   - **Uncheck semua** di bagian "Required approvals"
   - Save

**Hasil:**
- ✅ Tetap harus lewat PR (untuk history)
- ✅ Tapi tidak perlu approval (bisa langsung merge)
- ✅ Best of both worlds!

---

## 📝 Checklist Merge PR Sekarang

- [ ] Settings → Branches → Edit `main`
- [ ] Uncheck "Require a pull request before merging"
- [ ] Save
- [ ] Kembali ke PR → Merge
- [ ] Aktifkan kembali protection (optional)

---

## 🔗 Alternatif: GitHub CLI

Jika install GitHub CLI, bisa merge via command:

```bash
gh pr merge 1 --merge
```

Tapi tetap perlu bypass protection dulu.

