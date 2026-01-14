import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/equipment/[id] - Get single equipment
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
            deskripsi: true,
          },
        },
        _count: {
          select: { loans: true },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: 'Alat tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch equipment',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH /api/equipment/[id] - Update equipment (Admin only)
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
    const {
      nama,
      kode_alat,
      kategori_id,
      stok,
      status,
      gambar,
      harga_sewa,
      harga_alat,
      deskripsi,
      tags,
    } = body;

    // Cek apakah equipment ada
    const existing = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Alat tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek kategori jika diubah
    if (kategori_id && kategori_id.trim() !== existing.kategori_id) {
      const category = await prisma.category.findUnique({
        where: { id: kategori_id.trim() },
      });

      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Kategori tidak ditemukan' },
          { status: 404 }
        );
      }
    }

    // Cek kode_alat jika diubah
    if (kode_alat !== undefined) {
      const trimmedKode = kode_alat?.trim() || null;
      
      // Jika kode_alat diubah dan tidak null, cek apakah sudah digunakan
      if (trimmedKode && trimmedKode !== existing.kode_alat) {
        const existingKode = await prisma.equipment.findUnique({
          where: { kode_alat: trimmedKode },
        });

        if (existingKode) {
          return NextResponse.json(
            { success: false, error: 'Kode alat sudah digunakan' },
            { status: 400 }
          );
        }
      }
    }

    // Validasi status jika diubah
    let equipmentStatus = existing.status;
    if (status !== undefined) {
      const validStatuses = ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'];
      if (validStatuses.includes(status)) {
        equipmentStatus = status;
      }
    }

    // Validasi stok jika diubah
    let equipmentStok = existing.stok;
    if (stok !== undefined && stok !== null) {
      const parsedStok = parseInt(stok);
      if (isNaN(parsedStok) || parsedStok < 0) {
        return NextResponse.json(
          { success: false, error: 'Stok harus berupa angka >= 0' },
          { status: 400 }
        );
      }
      equipmentStok = parsedStok;
    }

    // Build update data
    const updateData = {};

    // Validasi dan proses tags jika diubah
    if (tags !== undefined) {
      let equipmentTags = [];
      if (Array.isArray(tags)) {
        // Filter dan trim tags, hapus yang kosong
        equipmentTags = tags
          .map(tag => typeof tag === 'string' ? tag.trim() : String(tag).trim())
          .filter(tag => tag.length > 0);
      } else if (typeof tags === 'string') {
        // Jika tags berupa string (comma-separated), split menjadi array
        equipmentTags = tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
      }
      // Set tags (bisa empty array)
      updateData.tags = equipmentTags;
    }
    if (nama !== undefined) updateData.nama = nama.trim();
    if (kode_alat !== undefined) updateData.kode_alat = kode_alat?.trim() || null;
    if (kategori_id !== undefined) updateData.kategori_id = kategori_id.trim();
    if (stok !== undefined) updateData.stok = equipmentStok;
    if (status !== undefined) updateData.status = equipmentStatus;
    if (gambar !== undefined) updateData.gambar = gambar?.trim() || null;
    if (harga_sewa !== undefined) updateData.harga_sewa = harga_sewa ? parseFloat(harga_sewa) : null;
    if (harga_alat !== undefined) updateData.harga_alat = harga_alat ? parseFloat(harga_alat) : null;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi?.trim() || null;

    // Update equipment
    const equipment = await prisma.equipment.update({
      where: { id },
      data: updateData,
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: equipment,
      message: 'Alat berhasil diupdate',
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    
    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'Kode alat sudah digunakan',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update equipment',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment/[id] - Delete equipment (Admin only)
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

    // Cek apakah equipment ada
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        _count: {
          select: { loans: true },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: 'Alat tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek apakah ada loan yang menggunakan equipment ini
    if (equipment._count.loans > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Tidak bisa menghapus alat karena masih digunakan dalam ${equipment._count.loans} peminjaman`,
        },
        { status: 400 }
      );
    }

    // Delete equipment
    await prisma.equipment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Alat berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    
    // Handle Prisma foreign key constraint error
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak bisa menghapus alat karena masih digunakan dalam peminjaman',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete equipment',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

