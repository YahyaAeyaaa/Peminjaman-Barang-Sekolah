import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/categories/[id] - Get single category
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipment: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch category',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH /api/categories/[id] - Update category (Admin only)
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
    const { nama, deskripsi } = body;

    // Cek apakah kategori ada
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Jika nama diubah, cek apakah nama baru sudah ada
    if (nama && nama.trim() !== existing.nama) {
      const namaExists = await prisma.category.findUnique({
        where: { nama: nama.trim() },
      });

      if (namaExists) {
        return NextResponse.json(
          { success: false, error: 'Kategori dengan nama ini sudah ada' },
          { status: 400 }
        );
      }
    }

    // Update kategori
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(nama && { nama: nama.trim() }),
        ...(deskripsi !== undefined && { deskripsi: deskripsi?.trim() || null }),
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Kategori berhasil diupdate',
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update category',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category (Admin only)
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

    // Cek apakah kategori ada
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipment: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek apakah ada equipment yang menggunakan kategori ini
    if (category._count.equipment > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Tidak bisa menghapus kategori karena masih digunakan oleh ${category._count.equipment} alat`,
        },
        { status: 400 }
      );
    }

    // Delete kategori
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    
    // Handle Prisma foreign key constraint error
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak bisa menghapus kategori karena masih digunakan oleh alat',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete category',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

