import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/categories - List semua kategori
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Build where clause
    let whereClause = {};
    if (search && search.trim() !== '') {
      whereClause = {
        OR: [
          { nama: { contains: search, mode: 'insensitive' } },
          { deskripsi: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { equipment: true },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create kategori baru (Admin only)
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
    const { nama, deskripsi } = body;

    // Validasi
    if (!nama || nama.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Nama kategori is required' },
        { status: 400 }
      );
    }

    // Cek apakah nama sudah ada (unique)
    const existing = await prisma.category.findUnique({
      where: { nama: nama.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Kategori dengan nama ini sudah ada' },
        { status: 400 }
      );
    }

    // Create kategori
    const category = await prisma.category.create({
      data: {
        nama: nama.trim(),
        deskripsi: deskripsi?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: 'Kategori berhasil dibuat',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create category',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

