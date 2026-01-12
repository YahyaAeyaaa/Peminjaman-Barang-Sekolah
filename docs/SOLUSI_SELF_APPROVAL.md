# Solusi: Pull Request Authors Can't Approve Their Own PR

## 🔴 Masalah

GitHub tidak mengizinkan author untuk approve PR sendiri dengan pesan:
> **"Pull request authors can't approve their own pull request."**

Ini adalah **default behavior** GitHub untuk mencegah self-approval.

---

## ✅ Solusi

Ada beberapa opsi:

### **Opsi 1: Ubah Branch Protection Rules (REKOMENDASI)**

Allow self-approval untuk owner/admin:

1. Buka repository → **Settings** → **Branches**
2. Klik **Edit** pada rule untuk `main`
3. Scroll ke bagian **"Require a pull request before merging"**
4. Centang opsi:
   - ✅ **"Allow specified actors to bypass required pull requests"**
   - Pilih: **Repository admins** atau **Repository admins and users with bypass permission**
5. **Save changes**

**Setelah ini:**
- Admin bisa langsung merge tanpa approval
- Atau bisa tetap require approval tapi admin bisa bypass

---

### **Opsi 2: Allow Self-Approval (Advanced)**

Jika ingin tetap require approval tapi allow self-approval:

1. Buka repository → **Settings** → **Branches**
2. Edit rule untuk `main`
3. Di bagian **"Require approvals"**, ada opsi:
   - **"Dismiss stale pull request approvals when new commits are pushed"**
   - **"Require review from Code Owners"** (optional)
4. **TIDAK ADA** setting langsung untuk allow self-approval di GitHub UI

**Alternatif:** Gunakan GitHub API atau GitHub Actions untuk auto-approve (advanced)

---

### **Opsi 3: Minta Orang Lain Approve**

Jika ada collaborator lain:
1. Tag mereka di PR: `@username`
2. Minta mereka untuk review & approve
3. Setelah approve, baru bisa merge

---

### **Opsi 4: Bypass Protection (Quick Fix)**

Untuk kali ini saja, bisa bypass:

1. Buka repository → **Settings** → **Branches**
2. Edit rule untuk `main`
3. **Sementara nonaktifkan** "Require a pull request before merging"
4. **Save**
5. Merge PR di GitHub (atau langsung push ke main)
6. **Aktifkan kembali** protection setelah merge

⚠️ **Tidak disarankan** karena melemahkan protection.

---

### **Opsi 5: Merge via Command Line (Bypass Protection)**

Jika kamu punya akses admin, bisa merge langsung via command line:

```bash
# Di local
git checkout main
git merge fix/update-config
git push origin main
```

Tapi ini akan **ditolak** jika branch protection aktif.

---

## 🎯 Rekomendasi untuk Project Sendiri

Karena ini project **personal/sendiri**, opsi terbaik:

### **Setup Branch Protection yang Fleksibel:**

1. **Require PR**: ✅ Aktifkan
2. **Require Approval**: ✅ Aktifkan (minimal 1)
3. **Allow Bypass**: ✅ **Aktifkan untuk Repository admins**

**Cara:**
1. Settings → Branches → Edit rule `main`
2. Centang: **"Allow specified actors to bypass required pull requests"**
3. Pilih: **"Repository admins"**
4. Save

**Hasil:**
- ✅ PR tetap required (untuk discipline)
- ✅ Tapi admin bisa bypass jika perlu (untuk efisiensi)
- ✅ Best of both worlds!

---

## 📝 Langkah Cepat (Sekarang)

**Untuk merge PR ini sekarang:**

### **Cara 1: Bypass Protection Sementara**
1. Settings → Branches → Edit `main`
2. Nonaktifkan "Require a pull request before merging"
3. Save
4. Merge PR
5. Aktifkan kembali protection

### **Cara 2: Allow Admin Bypass**
1. Settings → Branches → Edit `main`
2. Centang "Allow specified actors to bypass required pull requests"
3. Pilih "Repository admins"
4. Save
5. Kembali ke PR, klik "Merge pull request" (sekarang bisa langsung merge)

---

## 💡 Tips

- **Untuk project sendiri**: Allow admin bypass lebih praktis
- **Untuk project team**: Tetap require approval dari orang lain
- **Self-approval**: GitHub tidak support secara default, perlu workaround

---

## 🔗 Referensi

- [GitHub Docs: Requiring pull request reviews](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-pull-request-reviews-before-merging)
- [GitHub Docs: Bypassing branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#bypassing-branch-protection)

