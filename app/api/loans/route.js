import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST /api/loans - Create loan baru (Peminjam only)
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

    // Cek role peminjam
    if (session.user.role !== 'PEMINJAM') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Hanya peminjam yang bisa mengajukan peminjaman' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { equipment_id, jumlah, tanggal_deadline, keterangan } = body;

    // Validasi required fields
    if (!equipment_id || equipment_id.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Equipment ID wajib diisi' },
        { status: 400 }
      );
    }

    if (!jumlah || jumlah < 1) {
      return NextResponse.json(
        { success: false, error: 'Jumlah minimal 1' },
        { status: 400 }
      );
    }

    if (!tanggal_deadline) {
      return NextResponse.json(
        { success: false, error: 'Tanggal deadline wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi tanggal deadline harus setelah hari ini
    const deadlineDate = new Date(tanggal_deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadlineDate <= today) {
      return NextResponse.json(
        { success: false, error: 'Tanggal deadline harus setelah hari ini' },
        { status: 400 }
      );
    }

    // Cek apakah equipment ada
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipment_id },
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: 'Equipment tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validasi status equipment harus AVAILABLE
    if (equipment.status !== 'AVAILABLE') {
      return NextResponse.json(
        { success: false, error: 'Equipment tidak tersedia untuk dipinjam' },
        { status: 400 }
      );
    }

    // Validasi stok tersedia
    if (equipment.stok < jumlah) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Stok tidak mencukupi. Stok tersedia: ${equipment.stok}, jumlah yang diminta: ${jumlah}` 
        },
        { status: 400 }
      );
    }

    // Create loan
    const loan = await prisma.loan.create({
      data: {
        user_id: session.user.id,
        equipment_id: equipment_id,
        jumlah: parseInt(jumlah),
        tanggal_deadline: deadlineDate,
        keterangan: keterangan?.trim() || null,
        status: 'PENDING',
      },
      include: {
        equipment: {
          include: {
            kategori: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
        user: {
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
        message: 'Peminjaman berhasil diajukan, menunggu persetujuan petugas',
        data: loan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengajukan peminjaman',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// GET /api/loans - Get loans (untuk peminjam: hanya loans mereka sendiri)
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause
    let whereClause = {};

    // Jika role PEMINJAM, hanya tampilkan loans mereka sendiri
    if (session.user.role === 'PEMINJAM') {
      whereClause.user_id = session.user.id;
    }
    // Jika role PETUGAS atau ADMIN, bisa lihat semua loans

    // Filter by status jika ada
    if (status && ['PENDING', 'APPROVED', 'REJECTED', 'BORROWED', 'RETURNED', 'OVERDUE'].includes(status)) {
      whereClause.status = status;
    }

    const loans = await prisma.loan.findMany({
      where: whereClause,
      include: {
        return: {
          select: {
            id: true,
            status: true,
            confirmed_at: true,
            total_denda: true,
            foto_bukti: true,
          },
        },
        equipment: {
          include: {
            kategori: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        rejecter: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: loans,
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data peminjaman',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

