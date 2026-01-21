import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

const ACCEPTED_MIME = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
]);

export async function POST(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'Tidak ada file yang diupload' }, { status: 400 });
    }

    if (!ACCEPTED_MIME.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File harus berupa Excel (.xlsx, .xls) atau CSV' },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const existingEmails = new Set(
      (await prisma.user.findMany({ select: { email: true } })).map((u) => u.email.toLowerCase()),
    );

    const newUsers = [];
    const skipped = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    rows.forEach((row, idx) => {
      const normalized = {};
      Object.keys(row).forEach((key) => {
        normalized[key.toLowerCase()] = row[key];
      });

      const rowNumber = idx + 2; // header dianggap baris 1
      const email = normalized.email ? String(normalized.email).trim().toLowerCase() : '';
      const firstName = normalized.first_name ? String(normalized.first_name).trim() : '';
      const lastName = normalized.last_name ? String(normalized.last_name).trim() : '';
      const password = normalized.password ? String(normalized.password).trim() : '';
      const kelasRaw = normalized.kelas ? String(normalized.kelas).trim() : '';
      const noHp = normalized.no_hp ? String(normalized.no_hp).trim() : null;
      const alamat = normalized.alamat ? String(normalized.alamat).trim() : null;
      const roleRaw = normalized.role ? String(normalized.role).trim().toUpperCase() : 'PEMINJAM';

      let role = roleRaw;
      if (role === 'SISWA') role = 'PEMINJAM';

      if (!email || !firstName || !lastName || !password) {
        skipped.push({ rowNumber, row: normalized, reason: 'Email, first_name, last_name, dan password wajib' });
        return;
      }

      if (!emailRegex.test(email)) {
        skipped.push({ rowNumber, row: normalized, reason: 'Format email tidak valid' });
        return;
      }

      if (password.length < 6) {
        skipped.push({ rowNumber, row: normalized, reason: 'Password minimal 6 karakter' });
        return;
      }

      if (!['PEMINJAM', 'PETUGAS'].includes(role)) {
        skipped.push({ rowNumber, row: normalized, reason: 'Role harus PETUGAS atau SISWA/PEMINJAM' });
        return;
      }

      if (role === 'PEMINJAM' && !kelasRaw) {
        skipped.push({ rowNumber, row: normalized, reason: 'Kelas wajib untuk role SISWA/PEMINJAM' });
        return;
      }

      if (existingEmails.has(email)) {
        skipped.push({ rowNumber, row: normalized, reason: 'Email sudah terdaftar' });
        return;
      }

      existingEmails.add(email);

      newUsers.push({
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        role,
        kelas: role === 'PEMINJAM' ? kelasRaw : null,
        no_hp: noHp || null,
        alamat: alamat || null,
      });
    });

    if (newUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada user valid yang bisa diimport', skipped },
        { status: 400 },
      );
    }

    const usersWithHashed = await Promise.all(
      newUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      })),
    );

    const created = await prisma.$transaction(
      usersWithHashed.map((user) =>
        prisma.user.create({
          data: {
            email: user.email,
            password: user.password,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            kelas: user.kelas,
            no_hp: user.no_hp,
            alamat: user.alamat,
            username: null,
            is_active: true,
          },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            kelas: true,
            no_hp: true,
            alamat: true,
            is_active: true,
            created_at: true,
          },
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      message: `${created.length} user berhasil diimport`,
      data: created,
      skipped,
    });
  } catch (error) {
    console.error('Error importing users:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengimport user', message: error.message },
      { status: 500 },
    );
  }
}

