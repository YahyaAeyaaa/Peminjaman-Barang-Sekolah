import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLogger';

// GET /api/equipment - List semua equipment
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const kategori_id = searchParams.get('kategori_id');
    const status = searchParams.get('status');

    // Build where clause
    let whereClause = {};
    
    // Search filter
    if (search && search.trim() !== '') {
      whereClause.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { kode_alat: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Kategori filter
    if (kategori_id && kategori_id.trim() !== '') {
      whereClause.kategori_id = kategori_id.trim();
    }

    // Status filter
    if (status && ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'].includes(status)) {
      whereClause.status = status;
    }

    const equipment = await prisma.equipment.findMany({
      where: whereClause,
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
          },
        },
        _count: {
          select: { loans: true },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch equipment',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/equipment - Create equipment baru (Admin only)
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

    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    const {
      nama,
      kode_alat,
      kategori_id,
      stok,
      status,
      gambar,
      harga_sewa,
      harga_alat,
      deskripsi,
      tags,
    } = body;

    // Validasi required fields
    if (!nama || nama.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Nama alat wajib diisi' },
        { status: 400 }
      );
    }

    if (!kategori_id || kategori_id.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Kategori wajib dipilih' },
        { status: 400 }
      );
    }

    // Cek apakah kategori ada
    const category = await prisma.category.findUnique({
      where: { id: kategori_id },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek apakah kode_alat sudah ada (jika diisi)
    if (kode_alat && kode_alat.trim() !== '') {
      const existingKode = await prisma.equipment.findUnique({
        where: { kode_alat: kode_alat.trim() },
      });

      if (existingKode) {
        return NextResponse.json(
          { success: false, error: 'Kode alat sudah digunakan' },
          { status: 400 }
        );
      }
    }

    // Validasi status
    const validStatuses = ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'];
    const equipmentStatus = status && validStatuses.includes(status) ? status : 'AVAILABLE';

    // Validasi stok (harus >= 0)
    const equipmentStok = stok !== undefined && stok !== null ? parseInt(stok) : 0;
    if (equipmentStok < 0) {
      return NextResponse.json(
        { success: false, error: 'Stok tidak boleh negatif' },
        { status: 400 }
      );
    }

    // Validasi dan proses tags
    let equipmentTags = [];
    if (tags && Array.isArray(tags)) {
      // Filter dan trim tags, hapus yang kosong
      equipmentTags = tags
        .map(tag => typeof tag === 'string' ? tag.trim() : String(tag).trim())
        .filter(tag => tag.length > 0);
    } else if (tags && typeof tags === 'string') {
      // Jika tags berupa string (comma-separated), split menjadi array
      equipmentTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }

    // Prepare data untuk create
    const equipmentData = {
      nama: nama.trim(),
      kode_alat: kode_alat?.trim() || null,
      kategori_id: kategori_id.trim(),
      stok: equipmentStok,
      status: equipmentStatus,
      gambar: gambar?.trim() || null,
      harga_sewa: harga_sewa ? parseFloat(harga_sewa) : null,
      harga_alat: harga_alat ? parseFloat(harga_alat) : null,
      deskripsi: deskripsi?.trim() || null,
      tags: equipmentTags,
    };

    console.log('Data yang akan di-create:', equipmentData);

    // Create equipment
    const equipment = await prisma.equipment.create({
      data: equipmentData,
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: 'CREATE',
      tableName: 'equipment',
      recordId: equipment.id,
      newData: equipment,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(
      {
        success: true,
        data: equipment,
        message: 'Alat berhasil dibuat',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating equipment:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    
    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'Kode alat sudah digunakan',
        },
        { status: 400 }
      );
    }

    // Handle Prisma field not found error (misalnya tags belum ada di database)
    if (error.code === 'P2025' || error.message?.includes('Unknown field')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database schema tidak sesuai. Silakan jalankan migration.',
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create equipment',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

