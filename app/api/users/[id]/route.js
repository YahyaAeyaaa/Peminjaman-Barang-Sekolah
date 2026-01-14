import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - Get user by ID (Admin only)
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

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        no_hp: true,
        alamat: true,
        kelas: true,
        _count: {
          select: {
            loans: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user (Admin only)
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
    const { email, password, first_name, last_name, role, is_active, no_hp, alamat } = body;

    // Cek apakah user ada
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validasi email jika diubah
    if (email && email !== existingUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Format email tidak valid' },
          { status: 400 }
        );
      }

      // Cek apakah email sudah digunakan user lain
      const emailExists = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email sudah digunakan' },
          { status: 400 }
        );
      }
    }

    // Validasi password jika diubah
    if (password && password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Validasi role jika diubah - admin tidak bisa diubah menjadi admin lain, hanya bisa edit PETUGAS dan PEMINJAM
    if (role) {
      if (!['PETUGAS', 'PEMINJAM'].includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Hanya bisa mengubah role menjadi PETUGAS atau PEMINJAM' },
          { status: 400 }
        );
      }
      
      // Jangan biarkan ubah role user yang sudah ADMIN menjadi role lain
      if (existingUser.role === 'ADMIN' && role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Tidak dapat mengubah role Admin' },
          { status: 400 }
        );
      }
      
      // Jangan biarkan ubah role menjadi ADMIN
      if (role === 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Tidak dapat mengubah role menjadi Admin' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {};
    if (email) updateData.email = email.trim().toLowerCase();
    if (first_name) updateData.first_name = first_name.trim();
    if (last_name) updateData.last_name = last_name.trim();
    if (role) updateData.role = role;
    if (typeof is_active === 'boolean') updateData.is_active = is_active;
    if (no_hp !== undefined) updateData.no_hp = no_hp?.trim() || null;
    if (alamat !== undefined) updateData.alamat = alamat?.trim() || null;

    // Hash password jika diubah
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        no_hp: true,
        alamat: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User berhasil diupdate',
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengupdate user',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user (Admin only)
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

    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            loans: true,
            approved_loans: true,
            rejected_loans: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek apakah user masih punya peminjaman aktif
    if (user._count.loans > 0) {
      return NextResponse.json(
        { success: false, error: 'User masih memiliki peminjaman aktif. Tidak dapat dihapus.' },
        { status: 400 }
      );
    }

    // Jangan biarkan delete user sendiri
    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat menghapus akun sendiri' },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menghapus user',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

