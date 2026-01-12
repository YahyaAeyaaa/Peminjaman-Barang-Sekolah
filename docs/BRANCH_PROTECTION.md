# Cara Set Branch Protection untuk Main (Require Approval)

## Status Saat Ini
✅ ViewPage sudah di-merge ke main
✅ Main sudah di-push ke GitHub

## Cara Set Branch Protection di GitHub

### Langkah 1: Buka Settings Repository
1. Buka repository di GitHub: https://github.com/YahyaAeyaaa/Peminjaman-Barang-Sekolah
2. Klik tab **Settings** (di bagian atas)
3. Di sidebar kiri, klik **Branches**

### Langkah 2: Add Branch Protection Rule
1. Di bagian **Branch protection rules**, klik **Add rule** atau **Add branch protection rule**
2. Di field **Branch name pattern**, ketik: `main`
3. Centang opsi berikut:

#### ✅ Required Settings:
- **Require a pull request before merging**
  - ✅ Require approvals: **1** (atau lebih sesuai kebutuhan)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (optional)

- **Require status checks to pass before merging** (optional)
  - Jika ada CI/CD, centang ini

- **Require conversation resolution before merging** (recommended)
  - Semua komentar harus di-resolve sebelum merge

- **Require signed commits** (optional)
  - Untuk keamanan lebih

- **Require linear history** (optional)
  - Mencegah merge commit, hanya fast-forward

- **Do not allow bypassing the above settings** (recommended)
  - Bahkan admin tidak bisa bypass

- **Restrict who can push to matching branches**
  - Pilih: **Restrict pushes that create files larger than 100 MB** (optional)

#### ⚠️ PENTING:
- **JANGAN centang**: "Allow force pushes" dan "Allow deletions"
- Ini akan membuat main tidak bisa di-force push atau dihapus

### Langkah 3: Save
Klik **Create** atau **Save changes**

---

## Cara Merge dengan Approval (Workflow)

Setelah branch protection aktif, workflow-nya jadi:

### 1. Buat Branch Baru
```bash
git checkout -b feature/nama-fitur
# atau
git checkout -b fix/nama-bug
```

### 2. Push ke GitHub
```bash
git push -u origin feature/nama-fitur
```

### 3. Buat Pull Request
1. Buka GitHub repository
2. Klik **Pull requests** → **New pull request**
3. Pilih:
   - **base**: `main`
   - **compare**: `feature/nama-fitur`
4. Isi title dan description
5. Klik **Create pull request**

### 4. Review & Approval
- Reviewer akan review code
- Jika perlu perubahan, bisa request changes
- Setelah approve, baru bisa merge

### 5. Merge Pull Request
- Setelah di-approve, klik **Merge pull request**
- Pilih merge type:
  - **Create a merge commit** (recommended)
  - **Squash and merge**
  - **Rebase and merge**
- Klik **Confirm merge**

---

## Alternative: Merge via GitHub UI (Lebih Mudah)

Jika mau merge langsung dari GitHub tanpa command line:

1. Buka repository di GitHub
2. Klik **Pull requests**
3. Buat PR dari ViewPage ke main (jika belum)
4. Setelah di-approve, merge via UI

---

## Catatan
- Setelah branch protection aktif, **tidak bisa langsung push ke main**
- Harus lewat Pull Request dengan approval
- Ini membuat code lebih aman dan ter-review


