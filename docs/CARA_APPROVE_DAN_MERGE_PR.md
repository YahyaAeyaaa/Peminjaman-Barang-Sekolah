# Cara Approve dan Merge Pull Request

## 🔴 Masalah: Tombol Merge Disabled

Tombol "Merge pull request" masih **disabled (abu-abu)** karena:
- ❌ Belum ada approval
- ❌ Branch protection memerlukan minimal 1 approval

---

## ✅ Solusi: Approve PR Dulu

### **Langkah 1: Approve Pull Request**

Ada 2 cara untuk approve:

#### **Cara 1: Via Sidebar (Paling Mudah)**
1. Di **sidebar kanan**, cari bagian **"Reviewers"**
2. Klik **"Review changes"** atau **"Add your review"**
3. Scroll ke bawah, akan muncul form review
4. Pilih **"Approve"** (radio button)
5. (Optional) Tambahkan komentar
6. Klik **"Submit review"**

#### **Cara 2: Via Files Changed Tab**
1. Klik tab **"Files changed"** (di atas)
2. Scroll ke paling bawah
3. Di bagian **"Review changes"**, pilih **"Approve"**
4. Klik **"Submit review"**

---

### **Langkah 2: Merge Pull Request**

Setelah di-approve:
1. Kembali ke tab **"Conversation"**
2. Tombol **"Merge pull request"** sekarang sudah **aktif (hijau)**
3. Klik **"Merge pull request"**
4. Pilih merge type:
   - **Create a merge commit** (recommended) ✅
   - **Squash and merge**
   - **Rebase and merge**
5. Klik **"Confirm merge"**
6. ✅ **Selesai!** PR sudah di-merge ke main

---

## 📸 Visual Guide

### **Sebelum Approve:**
```
┌─────────────────────────────────┐
│  Review required                │
│  ❌ Merge pull request (disabled)│
└─────────────────────────────────┘
```

### **Setelah Approve:**
```
┌─────────────────────────────────┐
│  ✅ Approved by YahyaAeyaaa     │
│  ✅ Merge pull request (aktif)  │
└─────────────────────────────────┘
```

---

## 🎯 Quick Steps

1. **Klik "Review changes"** (di sidebar kanan atau bawah)
2. **Pilih "Approve"**
3. **Submit review**
4. **Klik "Merge pull request"** (sekarang sudah aktif)
5. **Confirm merge**
6. **Done!** ✅

---

## 💡 Tips

- **Sebagai owner**, kamu bisa approve PR sendiri
- **Setelah approve**, tombol merge langsung aktif
- **Pilih "Create a merge commit"** untuk keep history lengkap
- **Bisa delete branch** setelah merge (optional)

---

## 🔗 Lokasi Tombol

- **Review changes**: Di sidebar kanan bagian "Reviewers" atau di bawah halaman
- **Merge pull request**: Di bagian bawah PR, setelah di-approve

