import { NextResponse } from 'next/server';

// Registrasi dimatikan: semua akun dibuat oleh Admin melalui import atau panel user.
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Registrasi dimatikan. Hubungi Admin untuk dibuatkan akun.' },
    { status: 403 },
  );
}

