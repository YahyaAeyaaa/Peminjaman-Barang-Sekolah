import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

const ACCEPTED_MIME = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
]);

export async function POST(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'Tidak ada file yang diupload' }, { status: 400 });
    }

    if (!ACCEPTED_MIME.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File harus berupa Excel (.xlsx, .xls) atau CSV' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    // Map kategori by nama (lowercase)
    const categories = await prisma.category.findMany({ select: { id: true, nama: true } });
    const kategoriMap = new Map(categories.map((c) => [c.nama.toLowerCase().trim(), c.id]));

    // Existing kode_alat to prevent duplicates
    const existingKodeSet = new Set(
      (await prisma.equipment.findMany({ select: { kode_alat: true } }))
        .map((e) => e.kode_alat)
        .filter(Boolean)
        .map((k) => k.toLowerCase().trim()),
    );

    const newItems = [];
    const skipped = [];

    rows.forEach((row, idx) => {
      const normalized = {};
      Object.keys(row).forEach((key) => {
        normalized[key.toLowerCase()] = row[key];
      });

      const rowNumber = idx + 2; // header considered row 1
      const nama = normalized.nama ? String(normalized.nama).trim() : '';
      const kategoriNama =
        normalized.kategori || normalized.kategori_nama || normalized.category || normalized.category_name
          ? String(
              normalized.kategori ||
                normalized.kategori_nama ||
                normalized.category ||
                normalized.category_name,
            ).trim()
          : '';
      const kodeAlat = normalized.kode_alat ? String(normalized.kode_alat).trim() : '';
      const stokValue = normalized.stok !== '' ? parseInt(normalized.stok, 10) : 0;
      const hargaAlat = normalized.harga_alat !== '' ? parseFloat(normalized.harga_alat) : null;
      const deskripsi = normalized.deskripsi ? String(normalized.deskripsi).trim() : null;
      const tagsRaw = normalized.tags ? String(normalized.tags).trim() : '';
      const maxLoanSource =
        normalized.max_loan_duration ??
        normalized.max_loan ??
        normalized.max_duration ??
        normalized.lama_pinjam ??
        normalized.lama ??
        '';
      const maxLoanRaw = maxLoanSource !== undefined && maxLoanSource !== null
        ? String(maxLoanSource).trim()
        : '';
      const maxLoanVal = maxLoanRaw !== '' ? parseInt(maxLoanRaw, 10) : null;

      if (!nama) {
        skipped.push({ rowNumber, row: normalized, reason: 'Nama alat wajib' });
        return;
      }

      if (!kategoriNama) {
        skipped.push({ rowNumber, row: normalized, reason: 'Kategori wajib (nama kategori)' });
        return;
      }

      const kategoriId = kategoriMap.get(kategoriNama.toLowerCase());
      if (!kategoriId) {
        skipped.push({ rowNumber, row: normalized, reason: `Kategori "${kategoriNama}" tidak ditemukan` });
        return;
      }

      if (Number.isNaN(stokValue) || stokValue < 0) {
        skipped.push({ rowNumber, row: normalized, reason: 'Stok harus angka >= 0' });
        return;
      }

      if (maxLoanRaw !== '' && (Number.isNaN(maxLoanVal) || maxLoanVal <= 0)) {
        skipped.push({
          rowNumber,
          row: normalized,
          reason: 'max_loan_duration harus angka hari >= 1 (boleh dikosongkan)',
        });
        return;
      }

      if (kodeAlat) {
        const kodeKey = kodeAlat.toLowerCase();
        if (existingKodeSet.has(kodeKey)) {
          skipped.push({ rowNumber, row: normalized, reason: 'Kode alat sudah digunakan' });
          return;
        }
        existingKodeSet.add(kodeKey);
      }

      const tags =
        tagsRaw.length > 0
          ? tagsRaw
              .split(',')
              .map((t) => t.trim())
              .filter((t) => t.length > 0)
          : [];

      newItems.push({
        nama,
        kategori_id: kategoriId,
        kode_alat: kodeAlat || null,
        stok: stokValue,
        status: stokValue > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
        harga_alat: Number.isNaN(hargaAlat) ? null : hargaAlat,
        deskripsi,
        tags,
        max_loan_duration: maxLoanVal || null,
        harga_sewa: null,
        gambar: null,
      });
    });

    if (newItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada data alat valid untuk diimport', skipped },
        { status: 400 },
      );
    }

    const created = await prisma.$transaction(
      newItems.map((item) =>
        prisma.equipment.create({
          data: item,
          include: {
            kategori: { select: { id: true, nama: true } },
          },
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      message: `${created.length} alat berhasil diimport`,
      data: created,
      skipped,
    });
  } catch (error) {
    console.error('Error importing equipment:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengimport alat', message: error.message },
      { status: 500 },
    );
  }
}

