import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/auth/register - Register user baru dengan kode registrasi
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, email, first_name, last_name, password, confirm_password, kelas, no_hp, alamat } = body;

    // Validasi input
    if (!code || !email || !first_name || !last_name || !password || !confirm_password) {
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi' },
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

    if (password !== confirm_password) {
      return NextResponse.json(
        { success: false, error: 'Password dan konfirmasi password tidak cocok' },
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

    // Validasi kode registrasi (case insensitive)
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: 'PEMINJAM', // Default role untuk register
        kelas: kelas?.trim() || null,
        no_hp: no_hp?.trim() || null,
        alamat: alamat?.trim() || null,
        username: null, // Optional
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        kelas: true,
      },
    });

    // Update kode registrasi
    const newUsedCount = registrationCode.used_count + 1;
    await prisma.registrationCode.update({
      where: { id: registrationCode.id },
      data: {
        used_count: newUsedCount,
        // Jika sudah mencapai max usage, nonaktifkan
        ...(registrationCode.max_usage > 0 && newUsedCount >= registrationCode.max_usage
          ? { status: 'NONAKTIF' }
          : {}),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil, silakan login',
        data: user,
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

