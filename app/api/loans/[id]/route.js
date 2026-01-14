import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/loans/[id] - Detail loan
export async function GET(_request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: {
        return: {
          select: {
            id: true,
            status: true,
            confirmed_at: true,
            total_denda: true,
            foto_bukti: true,
            kondisi_alat: true,
            catatan: true,
          },
        },
        equipment: {
          include: {
            kategori: { select: { id: true, nama: true } },
          },
        },
        user: { select: { id: true, first_name: true, last_name: true, email: true } },
        approver: { select: { id: true, first_name: true, last_name: true } },
        rejecter: { select: { id: true, first_name: true, last_name: true } },
      },
    });

    if (!loan) {
      return NextResponse.json({ success: false, error: 'Loan tidak ditemukan' }, { status: 404 });
    }

    // Peminjam hanya boleh lihat loan miliknya
    if (session.user.role === 'PEMINJAM' && loan.user_id !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: loan });
  } catch (error) {
    console.error('Error fetching loan detail:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil detail peminjaman', message: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/loans/[id] - Update status loan (approve/reject/confirm take)
export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Hanya PETUGAS/ADMIN yang boleh memproses approval
    if (!['PETUGAS', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, rejection_reason } = body;

    if (!action || !['APPROVE', 'REJECT', 'CONFIRM_TAKE'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action tidak valid (APPROVE | REJECT | CONFIRM_TAKE)' },
        { status: 400 }
      );
    }

    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: { equipment: true },
    });

    if (!loan) {
      return NextResponse.json({ success: false, error: 'Loan tidak ditemukan' }, { status: 404 });
    }

    // Rules state machine sederhana
    if (action === 'APPROVE') {
      // Reservasi stok dilakukan pada saat APPROVE.
      // Logika:
      // - Hitung total jumlah yang sudah APPROVED untuk equipment yang sama
      // - Pastikan stok - totalApproved masih cukup untuk loan ini
      // - Jika setelah approve stok "tersisa" 0, auto-reject semua PENDING lain untuk equipment tersebut

      const updated = await prisma.$transaction(async (tx) => {
        const currentLoan = await tx.loan.findUnique({
          where: { id: loan.id },
          include: { equipment: true },
        });

        if (!currentLoan) {
          throw new Error('Loan tidak ditemukan');
        }

        if (currentLoan.status !== 'PENDING') {
          throw new Error('Loan tidak dalam status PENDING');
        }

        // Hitung total jumlah yang sudah APPROVED untuk equipment yang sama
        const approvedAgg = await tx.loan.aggregate({
          where: {
            equipment_id: currentLoan.equipment_id,
            status: 'APPROVED',
          },
          _sum: { jumlah: true },
        });

        const alreadyApprovedJumlah = approvedAgg._sum.jumlah || 0;
        const tersedia = currentLoan.equipment.stok - alreadyApprovedJumlah;

        if (tersedia < currentLoan.jumlah) {
          throw new Error(
            `Stok tidak mencukupi untuk menyetujui peminjaman ini. Sisa stok yang bisa di-approve: ${Math.max(
              tersedia,
              0
            )}, diminta: ${currentLoan.jumlah}`
          );
        }

        // Approve loan ini
        const updatedLoan = await tx.loan.update({
          where: { id: currentLoan.id },
          data: {
            status: 'APPROVED',
            approved_by: session.user.id,
            approved_at: new Date(),
            rejected_by: null,
            rejection_reason: null,
          },
          include: {
            equipment: { include: { kategori: { select: { id: true, nama: true } } } },
            user: { select: { id: true, first_name: true, last_name: true, email: true } },
          },
        });

        // Setelah approve, cek lagi total APPROVED
        const newApprovedTotal = alreadyApprovedJumlah + currentLoan.jumlah;

        // Jika total APPROVED >= stok, auto-reject semua PENDING lain
        if (newApprovedTotal >= currentLoan.equipment.stok) {
          await tx.loan.updateMany({
            where: {
              id: { not: currentLoan.id },
              equipment_id: currentLoan.equipment_id,
              status: 'PENDING',
            },
            data: {
              status: 'REJECTED',
              rejected_by: session.user.id,
              rejection_reason: 'Stok sudah habis / terpakai oleh peminjaman lain',
            },
          });
        }

        return updatedLoan;
      });

      return NextResponse.json({ success: true, message: 'Peminjaman disetujui', data: updated });
    }

    if (action === 'REJECT') {
      if (loan.status !== 'PENDING') {
        return NextResponse.json(
          { success: false, error: 'Loan tidak dalam status PENDING' },
          { status: 400 }
        );
      }
      if (!rejection_reason || rejection_reason.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: 'Alasan penolakan wajib diisi' },
          { status: 400 }
        );
      }

      const updated = await prisma.loan.update({
        where: { id: loan.id },
        data: {
          status: 'REJECTED',
          rejected_by: session.user.id,
          rejection_reason: rejection_reason.trim(),
          approved_by: null,
          approved_at: null,
        },
        include: {
          equipment: { include: { kategori: { select: { id: true, nama: true } } } },
          user: { select: { id: true, first_name: true, last_name: true, email: true } },
        },
      });

      return NextResponse.json({ success: true, message: 'Peminjaman ditolak', data: updated });
    }

    // CONFIRM_TAKE: ubah APPROVED -> BORROWED dan kurangi stok
    if (action === 'CONFIRM_TAKE') {
      if (loan.status !== 'APPROVED') {
        return NextResponse.json(
          { success: false, error: 'Loan tidak dalam status APPROVED' },
          { status: 400 }
        );
      }

      // Validasi stok masih mencukupi saat barang benar-benar diambil
      if (loan.equipment.stok < loan.jumlah) {
        return NextResponse.json(
          {
            success: false,
            error: `Stok tidak mencukupi saat konfirmasi ambil. Stok: ${loan.equipment.stok}, diminta: ${loan.jumlah}`,
          },
          { status: 400 }
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        // Kurangi stok
        const newStock = loan.equipment.stok - loan.jumlah;
        await tx.equipment.update({
          where: { id: loan.equipment_id },
          data: {
            stok: newStock,
            status: newStock > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
          },
        });

        // Update loan status
        const updatedLoan = await tx.loan.update({
          where: { id: loan.id },
          data: {
            status: 'BORROWED',
            tanggal_ambil: new Date(),
          },
          include: {
            equipment: { include: { kategori: { select: { id: true, nama: true } } } },
            user: { select: { id: true, first_name: true, last_name: true, email: true } },
          },
        });

        // Jika stok habis, auto-reject semua loan lain yang masih PENDING untuk equipment yang sama
        if (newStock <= 0) {
          await tx.loan.updateMany({
            where: {
              id: { not: loan.id },
              equipment_id: loan.equipment_id,
              status: 'PENDING',
            },
            data: {
              status: 'REJECTED',
              rejected_by: session.user.id,
              rejection_reason: 'Stok habis, peminjaman tidak dapat diproses',
            },
          });
        }

        return updatedLoan;
      });

      return NextResponse.json({ success: true, message: 'Barang dikonfirmasi sudah diambil', data: updated });
    }

    return NextResponse.json({ success: false, error: 'Unhandled action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses peminjaman', message: error.message },
      { status: 500 }
    );
  }
}


