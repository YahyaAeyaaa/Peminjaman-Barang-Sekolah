import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST /api/upload - Upload image (Admin only)
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

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada file yang diupload' },
        { status: 400 }
      );
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File harus berupa gambar' },
        { status: 400 }
      );
    }

    // Validasi ukuran file (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${fileExtension}`;

    // Create uploads directory if not exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file to public/uploads
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Return URL
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        filename: filename,
        size: file.size,
        type: file.type,
      },
      message: 'Gambar berhasil diupload',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengupload gambar',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

