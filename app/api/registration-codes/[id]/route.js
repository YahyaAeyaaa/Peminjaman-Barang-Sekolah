import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/registration-codes/[id] - Get kode registrasi by ID (Admin only)
export async function GET(request, { params }) {
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

    const { id } = params;

    const code = await prisma.registrationCode.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Kode registrasi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: code,
    });
  } catch (error) {
    console.error('Error fetching registration code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch registration code',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH /api/registration-codes/[id] - Update kode registrasi (Admin only)
export async function PATCH(request, { params }) {
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

    const { id } = params;
    const body = await request.json();
    const { code, keterangan, max_usage, expire_date, status } = body;

    // Cek apakah kode ada
    const existingCode = await prisma.registrationCode.findUnique({
      where: { id },
    });

    if (!existingCode) {
      return NextResponse.json(
        { success: false, error: 'Kode registrasi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validasi code jika diubah
    if (code && code.trim() !== existingCode.code) {
      const codeExists = await prisma.registrationCode.findUnique({
        where: { code: code.trim().toUpperCase() },
      });

      if (codeExists) {
        return NextResponse.json(
          { success: false, error: 'Kode registrasi sudah digunakan' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (keterangan !== undefined) updateData.keterangan = keterangan?.trim() || null;
    if (max_usage !== undefined) {
      const maxUsageValue = parseInt(max_usage);
      if (maxUsageValue < 0) {
        return NextResponse.json(
          { success: false, error: 'Max usage tidak boleh negatif' },
          { status: 400 }
        );
      }
      updateData.max_usage = maxUsageValue;
    }
    if (expire_date !== undefined) {
      if (expire_date === null || expire_date === '') {
        updateData.expire_date = null;
      } else {
        const expireDateValue = new Date(expire_date);
        if (isNaN(expireDateValue.getTime())) {
          return NextResponse.json(
            { success: false, error: 'Format tanggal expire tidak valid' },
            { status: 400 }
          );
        }
        updateData.expire_date = expireDateValue;
      }
    }
    if (status && ['AKTIF', 'NONAKTIF', 'EXPIRED'].includes(status)) {
      updateData.status = status;
    }

    // Update registration code
    const updatedCode = await prisma.registrationCode.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Kode registrasi berhasil diupdate',
      data: updatedCode,
    });
  } catch (error) {
    console.error('Error updating registration code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengupdate kode registrasi',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/registration-codes/[id] - Delete kode registrasi (Admin only)
export async function DELETE(request, { params }) {
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

    const { id } = params;

    // Cek apakah kode ada
    const code = await prisma.registrationCode.findUnique({
      where: { id },
    });

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Kode registrasi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete registration code
    await prisma.registrationCode.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Kode registrasi berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting registration code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menghapus kode registrasi',
        message: error.message,
      },
      { status: 500 }
    );
  }
}



