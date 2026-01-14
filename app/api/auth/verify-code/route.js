import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/auth/verify-code - Verifikasi kode registrasi
export async function POST(request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || code.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Kode registrasi wajib diisi' },
        { status: 400 }
      );
    }

    // Cari kode registrasi
    const registrationCode = await prisma.registrationCode.findUnique({
      where: { code: code.trim() },
    });

    if (!registrationCode) {
      return NextResponse.json(
        { success: false, error: 'Kode registrasi tidak valid' },
        { status: 400 }
      );
    }

    // Cek status
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

    // Kode valid
    return NextResponse.json({
      success: true,
      message: 'Kode registrasi valid',
      data: {
        code: registrationCode.code,
        keterangan: registrationCode.keterangan,
        max_usage: registrationCode.max_usage,
        used_count: registrationCode.used_count,
        expire_date: registrationCode.expire_date,
      },
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memverifikasi kode',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

