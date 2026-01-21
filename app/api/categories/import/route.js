import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLogger';

// POST /api/categories/import - Import categories from Excel (Admin only)
export async function POST(request) {
  try {
    const session = await auth();

    // Cek authentication
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cek role admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File Excel tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak didukung. Gunakan file Excel (.xlsx, .xls) atau CSV (.csv)' },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse Excel file
    let workbook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'File Excel tidak valid atau corrupt' },
        { status: 400 }
      );
    }

    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return NextResponse.json(
        { success: false, error: 'File Excel tidak memiliki sheet' },
        { status: 400 }
      );
    }

    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: ['nama', 'deskripsi'], // Header mapping
      defval: '', // Default value untuk empty cells
    });

    // Validate data
    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File Excel kosong atau tidak memiliki data' },
        { status: 400 }
      );
    }

    // Process data
    const categoriesToCreate = [];
    const errors = [];
    const skipped = [];

    // Get existing categories untuk cek duplicate
    const existingCategories = await prisma.category.findMany({
      select: { nama: true },
    });
    const existingNames = new Set(existingCategories.map(cat => cat.nama.toLowerCase().trim()));

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 karena header di row 1, dan array index mulai 0

      // Get nama (bisa dari kolom nama atau kolom pertama)
      const nama = row.nama || row[Object.keys(row)[0]] || '';
      const deskripsi = row.deskripsi || row[Object.keys(row)[1]] || '';

      // Skip empty rows
      if (!nama || !nama.toString().trim()) {
        skipped.push({ row: rowNumber, reason: 'Nama kosong' });
        continue;
      }

      const namaTrimmed = nama.toString().trim();
      const deskripsiTrimmed = deskripsi ? deskripsi.toString().trim() : null;

      // Cek duplicate (case-insensitive)
      if (existingNames.has(namaTrimmed.toLowerCase())) {
        skipped.push({ row: rowNumber, nama: namaTrimmed, reason: 'Kategori sudah ada' });
        continue;
      }

      // Add to categories to create
      categoriesToCreate.push({
        nama: namaTrimmed,
        deskripsi: deskripsiTrimmed || null,
      });

      // Add to existing names untuk cek duplicate dalam file yang sama
      existingNames.add(namaTrimmed.toLowerCase());
    }

    // Jika tidak ada data valid
    if (categoriesToCreate.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak ada data valid untuk diimport',
          skipped: skipped.length > 0 ? skipped : undefined,
        },
        { status: 400 }
      );
    }

    // Bulk create categories
    const createdCategories = await prisma.$transaction(
      categoriesToCreate.map((category) =>
        prisma.category.create({
          data: category,
        })
      )
    );

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: 'IMPORT',
      tableName: 'categories',
      recordId: 'bulk-import',
      newData: {
        count: createdCategories.length,
        categories: createdCategories.map((cat) => ({ id: cat.id, nama: cat.nama })),
      },
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimport ${createdCategories.length} kategori`,
      data: {
        created: createdCategories.length,
        skipped: skipped.length,
        details: {
          created: createdCategories.map((cat) => ({ id: cat.id, nama: cat.nama })),
          skipped: skipped.length > 0 ? skipped : undefined,
        },
      },
    });
  } catch (error) {
    console.error('Error importing categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengimport kategori',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

