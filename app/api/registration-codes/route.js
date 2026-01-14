import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/registration-codes - List semua kode registrasi (Admin only)
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // Filter by status

    // Build where clause
    let whereClause = {};

    // Search filter
    if (search && search.trim() !== '') {
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { keterangan: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status && ['AKTIF', 'NONAKTIF', 'EXPIRED'].includes(status)) {
      whereClause.status = status;
    }

    const codes = await prisma.registrationCode.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: codes,
    });
  } catch (error) {
    console.error('Error fetching registration codes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch registration codes',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/registration-codes - Create kode registrasi baru (Admin only)
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
    const { code, keterangan, max_usage, expire_date, status } = body;

    // Validasi
    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: 'Kode registrasi wajib diisi' },
        { status: 400 }
      );
    }

    // Cek apakah kode sudah ada
    const existing = await prisma.registrationCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Kode registrasi sudah digunakan' },
        { status: 400 }
      );
    }

    // Validasi max_usage
    const maxUsageValue = max_usage ? parseInt(max_usage) : 0;
    if (maxUsageValue < 0) {
      return NextResponse.json(
        { success: false, error: 'Max usage tidak boleh negatif' },
        { status: 400 }
      );
    }

    // Validasi status
    const statusValue = status || 'AKTIF';
    if (!['AKTIF', 'NONAKTIF'].includes(statusValue)) {
      return NextResponse.json(
        { success: false, error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Parse expire_date jika ada
    let expireDateValue = null;
    if (expire_date) {
      expireDateValue = new Date(expire_date);
      if (isNaN(expireDateValue.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Format tanggal expire tidak valid' },
          { status: 400 }
        );
      }
    }

    // Create registration code
    const registrationCode = await prisma.registrationCode.create({
      data: {
        code: code.trim().toUpperCase(),
        keterangan: keterangan?.trim() || null,
        max_usage: maxUsageValue,
        used_count: 0,
        expire_date: expireDateValue,
        status: statusValue,
        created_by: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Kode registrasi berhasil dibuat',
        data: registrationCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating registration code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal membuat kode registrasi',
        message: error.message,
      },
      { status: 500 }
    );
  }
}



