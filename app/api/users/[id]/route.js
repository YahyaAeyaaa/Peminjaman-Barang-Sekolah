import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLogger';

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

// PATCH /api/users/[id] - Update user
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

    const { id } = params;
    const body = await request.json();
    const { email, password, first_name, last_name, role, is_active, no_hp, alamat, avatar } = body;

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

    // Hanya ADMIN atau user itu sendiri yang boleh update
    const isAdmin = session.user.role === 'ADMIN';
    const isSelf = session.user.id === id;

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin or owner only' },
        { status: 403 }
      );
    }

    // Validasi & persiapan data update
    const updateData = {};

    if (isAdmin) {
      // ADMIN bisa mengubah field lengkap (email, password, role, status, dll)

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

      if (email) updateData.email = email.trim().toLowerCase();
      if (first_name) updateData.first_name = first_name.trim();
      if (last_name) updateData.last_name = last_name.trim();
      if (role) updateData.role = role;
      if (typeof is_active === 'boolean') updateData.is_active = is_active;
      if (no_hp !== undefined) updateData.no_hp = no_hp?.trim() || null;
      if (alamat !== undefined) updateData.alamat = alamat?.trim() || null;
      if (avatar !== undefined) updateData.avatar = avatar || null;

      // Hash password jika diubah
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
    } else {
      // Non-admin (PEMINJAM/PETUGAS) hanya boleh mengubah data profil dasar
      if (first_name) updateData.first_name = first_name.trim();
      if (last_name) updateData.last_name = last_name.trim();
      if (no_hp !== undefined) updateData.no_hp = no_hp?.trim() || null;
      if (alamat !== undefined) updateData.alamat = alamat?.trim() || null;
      if (avatar !== undefined) updateData.avatar = avatar || null;
    }

    // Prepare old data for logging (exclude password)
    const oldData = {
      id: existingUser.id,
      email: existingUser.email,
      first_name: existingUser.first_name,
      last_name: existingUser.last_name,
      role: existingUser.role,
      is_active: existingUser.is_active,
      no_hp: existingUser.no_hp,
      alamat: existingUser.alamat,
    };

    // Pastikan ada data yang diubah
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak ada data yang diubah',
        },
        { status: 400 }
      );
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
        avatar: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        no_hp: true,
        alamat: true,
      },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: 'UPDATE',
      tableName: 'users',
      recordId: user.id,
      oldData,
      newData: user,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
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

    // Jangan biarkan delete user sendiri
    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat menghapus akun sendiri' },
        { status: 400 }
      );
    }

    // Cek apakah user masih punya peminjaman aktif
    // Loan yang masih aktif: PENDING, APPROVED, BORROWED, OVERDUE
    const activeLoansCount = await prisma.loan.count({
      where: {
        user_id: id,
        status: {
          in: ['PENDING', 'APPROVED', 'BORROWED', 'OVERDUE'],
        },
      },
    });

    if (activeLoansCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `User masih memiliki ${activeLoansCount} peminjaman aktif. Tidak dapat dihapus.` 
        },
        { status: 400 }
      );
    }

    // Prepare old data for logging (exclude password)
    const oldData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
    };

    // Urutan hapus karena foreign key constraint:
    // 1. Hapus returns (yang reference ke loans)
    // 2. Hapus loans yang sudah selesai (REJECTED, RETURNED)
    // 3. Baru hapus user

    // 1. Hapus semua returns yang terkait dengan loans user ini
    const loansWithReturns = await prisma.loan.findMany({
      where: {
        user_id: id,
        status: {
          in: ['REJECTED', 'RETURNED'],
        },
      },
      select: {
        id: true,
      },
    });

    const loanIds = loansWithReturns.map(loan => loan.id);
    if (loanIds.length > 0) {
      // Hapus returns yang reference ke loans tersebut
      await prisma.return.deleteMany({
        where: {
          loan_id: {
            in: loanIds,
          },
        },
      });
    }

    // 2. Hapus semua loans yang sudah selesai (REJECTED, RETURNED)
    await prisma.loan.deleteMany({
      where: {
        user_id: id,
        status: {
          in: ['REJECTED', 'RETURNED'],
        },
      },
    });

    // 3. Hapus user
    await prisma.user.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: 'DELETE',
      tableName: 'users',
      recordId: id,
      oldData,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
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

