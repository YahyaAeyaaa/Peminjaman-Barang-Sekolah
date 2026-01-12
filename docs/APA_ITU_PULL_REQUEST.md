# Apa itu Pull Request (PR)?

## 📖 Penjelasan Sederhana

**Pull Request (PR)** adalah cara untuk mengusulkan perubahan code dari satu branch ke branch lain (biasanya ke `main`).

### Analogi Sederhana:
Bayangkan kamu punya buku (repository), dan kamu mau tambahin bab baru (branch baru). 
- Kamu tulis bab baru di kertas terpisah (branch `fix/update-config`)
- Lalu kamu kasih ke editor (buat PR) untuk di-review
- Editor cek dulu, kalau oke baru di-merge ke buku utama (branch `main`)

---

## 🔄 Alur Kerja dengan Pull Request

### **Tanpa Branch Protection:**
```
1. Buat branch → 2. Commit → 3. Push → 4. Langsung merge ke main ✅
```

### **Dengan Branch Protection (seperti sekarang):**
```
1. Buat branch → 2. Commit → 3. Push → 4. Buat PR → 5. Review → 6. Approve → 7. Merge ✅
```

---

## 🎯 Kenapa Pakai Pull Request?

### ✅ **Keuntungan:**
1. **Code Review** - Orang lain bisa cek code sebelum di-merge
2. **Diskusi** - Bisa diskusi tentang perubahan
3. **History** - Ada record siapa yang approve dan kenapa
4. **Quality Control** - Mencegah code yang belum siap masuk ke main
5. **Collaboration** - Tim bisa kerja bareng tanpa konflik

### 📋 **Contoh Skenario:**
- Kamu buat fitur baru di branch `feature/equipment-api`
- Kamu push ke GitHub
- Kamu buat PR dari `feature/equipment-api` → `main`
- Teman kamu review, kasih komentar: "Bagus, tapi kurang error handling"
- Kamu perbaiki, push lagi ke branch yang sama
- PR otomatis update
- Teman kamu approve
- Kamu merge ke main ✅

---

## 🔍 "Compare & pull request" Button

Ketika kamu push branch baru ke GitHub, biasanya muncul tombol kuning:

```
┌─────────────────────────────────────────┐
│  fix/update-config had recent pushes    │
│  [Compare & pull request]  ← Tombol ini │
└─────────────────────────────────────────┘
```

**Tombol ini muncul karena:**
- Kamu baru push branch baru (`fix/update-config`)
- GitHub detect ada branch yang belum di-merge ke `main`
- GitHub kasih shortcut untuk langsung buat PR

**Klik tombol itu = Langsung buka halaman buat PR!**

---

## 📝 Langkah-langkah Pull Request

### **1. Buat Branch & Push**
```bash
git checkout -b fix/update-config
git add .
git commit -m "Update docs"
git push -u origin fix/update-config
```

### **2. Klik "Compare & pull request"**
Atau buka: `https://github.com/username/repo/compare/main...fix/update-config`

### **3. Isi Form PR**
- **Title**: Judul perubahan
- **Description**: Penjelasan detail perubahan
- **Reviewers**: Tag orang yang mau review (optional)
- **Labels**: Tag kategori (optional)

### **4. Create Pull Request**
Klik tombol hijau "Create pull request"

### **5. Review & Approve**
- Reviewer cek code
- Kasih komentar jika perlu
- Approve jika sudah oke

### **6. Merge**
- Setelah di-approve, klik "Merge pull request"
- Pilih merge type:
  - **Create a merge commit** (recommended) - Simpan history lengkap
  - **Squash and merge** - Gabung semua commit jadi 1
  - **Rebase and merge** - Linear history

### **7. Selesai!**
- Code sudah masuk ke `main`
- Branch bisa di-delete (optional)

---

## 🎨 Tampilan Pull Request di GitHub

```
┌─────────────────────────────────────────────┐
│  Update: Add roadmap and docs              │
│  fix/update-config → main                  │
│  [4 files changed, 339 insertions(+)]     │
│                                            │
│  ☑️ Checks passing                         │
│  👤 1 reviewer required                    │
│  [Reviewers] [Labels] [Assignees]         │
│                                            │
│  [Files changed] [Commits] [Checks]         │
│                                            │
│  ┌─────────────────────────────────────┐  │
│  │  Changes in this PR:                │  │
│  │  + docs/ROADMAP.md                  │  │
│  │  + docs/BRANCH_PROTECTION.md        │  │
│  │  ...                                 │  │
│  └─────────────────────────────────────┘  │
│                                            │
│  [Comment] [Approve] [Request changes]    │
│  [Merge pull request]                     │
└─────────────────────────────────────────────┘
```

---

## 🔒 Branch Protection & PR

Karena kamu sudah set **branch protection** untuk `main`:
- ✅ **Tidak bisa langsung push ke main** (akan ditolak)
- ✅ **Harus lewat Pull Request** dulu
- ✅ **Harus di-approve** sebelum merge
- ✅ **Lebih aman** - code ter-review dulu

---

## 💡 Tips

1. **PR Title yang Baik:**
   - ❌ "Update"
   - ✅ "Update: Add roadmap and branch protection docs"

2. **PR Description yang Baik:**
   - Jelaskan **apa** yang diubah
   - Jelaskan **kenapa** diubah
   - Sertakan **screenshot** jika ada perubahan UI

3. **Ukuran PR:**
   - PR kecil lebih mudah di-review
   - Jika perubahan besar, pecah jadi beberapa PR

4. **Review PR Sendiri:**
   - Sebelum minta review, cek sendiri dulu
   - Pastikan tidak ada typo
   - Pastikan code berjalan

---

## 🚀 Quick Start untuk PR Pertama

1. **Push branch baru** → GitHub kasih tombol "Compare & pull request"
2. **Klik tombol itu** → Langsung buka form PR
3. **Isi title & description** → Copy dari template
4. **Create pull request** → PR dibuat!
5. **Approve sendiri** (karena kamu owner) → Klik "Approve"
6. **Merge** → Klik "Merge pull request"
7. **Selesai!** ✅

---

## 📚 Referensi

- [GitHub Docs: About Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- [GitHub Docs: Creating a Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)

