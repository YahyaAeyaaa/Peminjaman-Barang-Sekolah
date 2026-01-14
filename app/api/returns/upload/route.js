import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST /api/returns/upload - Upload foto bukti pengembalian (Authenticated users)
export async function POST(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'Tidak ada file yang diupload' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'File harus berupa gambar' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: 'Ukuran file maksimal 10MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split('.').pop();
    const filename = `return-${timestamp}-${randomString}.${ext}`;

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'returns');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/returns/${filename}`;

    return NextResponse.json({
      success: true,
      data: { url: fileUrl, filename, size: file.size, type: file.type },
      message: 'Foto bukti berhasil diupload',
    });
  } catch (error) {
    console.error('Error uploading return proof:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupload foto bukti', message: error.message },
      { status: 500 }
    );
  }
}


