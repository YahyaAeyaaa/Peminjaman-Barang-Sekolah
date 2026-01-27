import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/auth/register - Register user dengan kode registrasi
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, email, first_name, last_name, password, kelas, no_hp, alamat } = body;

    // Validasi kode registrasi wajib
    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: 'Kode registrasi wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi field wajib
    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    if (!first_name || !first_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama depan wajib diisi' },
        { status: 400 }
      );
    }

    if (!last_name || !last_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama belakang wajib diisi' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Cari dan validasi kode registrasi
    const registrationCode = await prisma.registrationCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!registrationCode) {
      return NextResponse.json(
        { success: false, error: 'Kode registrasi tidak valid' },
        { status: 400 }
      );
    }

    // Cek status kode
    if (registrationCode.status !== 'AKTIF') {
      return NextResponse.json(
        { success: false, error: 'Kode registrasi tidak aktif' },
        { status: 400 }
      );
    }

    // Cek expire date
    if (registrationCode.expire_date && new Date(registrationCode.expire_date) < new Date()) {
      // Update status ke EXPIRED
      await prisma.registrationCode.update({
        where: { id: registrationCode.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        { success: false, error: 'Kode registrasi sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Cek max usage
    if (registrationCode.max_usage > 0 && registrationCode.used_count >= registrationCode.max_usage) {
      return NextResponse.json(
        { success: false, error: 'Kode registrasi sudah mencapai batas penggunaan' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user dalam transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: email.trim().toLowerCase(),
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          password: hashedPassword,
          role: 'PEMINJAM', // Auto set role sebagai PEMINJAM
          kelas: kelas?.trim() || null,
          no_hp: no_hp?.trim() || null,
          alamat: alamat?.trim() || null,
          is_active: true,
        },
      });

      // Update used_count pada registration code
      const newUsedCount = registrationCode.used_count + 1;
      const shouldDeactivate = registrationCode.max_usage > 0 && newUsedCount >= registrationCode.max_usage;

      await tx.registrationCode.update({
        where: { id: registrationCode.id },
        data: {
          used_count: newUsedCount,
          status: shouldDeactivate ? 'NONAKTIF' : 'AKTIF',
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil. Silakan login.',
        data: {
          id: result.id,
          email: result.email,
          first_name: result.first_name,
          last_name: result.last_name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal melakukan registrasi',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
