import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/users - List semua users (Admin only)
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
    const role = searchParams.get('role'); // Filter by role

    // Build where clause
    let whereClause = {};

    // Search filter
    if (search && search.trim() !== '') {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (role && ['ADMIN', 'PETUGAS', 'PEMINJAM'].includes(role)) {
      whereClause.role = role;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        no_hp: true,
        alamat: true,
        kelas: true,
        _count: {
          select: {
            loans: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/users - Create user baru (Admin only, khusus untuk petugas)
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
    const { email, password, first_name, last_name, role, no_hp, alamat } = body;

    // Validasi
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, first_name, dan last_name wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Validasi password
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Validasi role - hanya bisa buat PETUGAS saja (admin tidak bisa dibuat dari sini)
    const userRole = role || 'PETUGAS'; // Default PETUGAS
    if (userRole !== 'PETUGAS') {
      return NextResponse.json(
        { success: false, error: 'Hanya bisa membuat akun dengan role PETUGAS' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: userRole,
        no_hp: no_hp?.trim() || null,
        alamat: alamat?.trim() || null,
        username: null,
        kelas: null,
        is_active: true,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
        no_hp: true,
        alamat: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User berhasil dibuat',
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal membuat user',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

