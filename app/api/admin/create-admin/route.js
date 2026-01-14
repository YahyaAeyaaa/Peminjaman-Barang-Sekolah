import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/admin/create-admin - Create admin user (hanya untuk setup awal)
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name } = body;

    // Validasi
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi' },
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

    // Create admin
    const admin = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: 'ADMIN',
        username: null,
        kelas: null,
        no_hp: null,
        alamat: null,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Admin berhasil dibuat',
        data: admin,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal membuat admin',
        message: error.message,
      },
      { status: 500 }
    );
  }
}





