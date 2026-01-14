import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// PATCH /api/returns/[id] - Confirm return received (PETUGAS/ADMIN)
export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!['PETUGAS', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { confirm_payment } = body; // boolean

    const ret = await prisma.return.findUnique({
      where: { id: params.id },
      include: {
        loan: { include: { equipment: true } },
      },
    });

    if (!ret) {
      return NextResponse.json({ success: false, error: 'Data pengembalian tidak ditemukan' }, { status: 404 });
    }

    if (ret.status !== 'MENUNGGU_PEMBAYARAN') {
      return NextResponse.json(
        { success: false, error: 'Pengembalian ini sudah diproses' },
        { status: 400 }
      );
    }

    // Jika ada denda, wajib confirm_payment=true
    const totalDenda = Number(ret.total_denda || 0);
    if (totalDenda > 0 && confirm_payment !== true) {
      return NextResponse.json(
        { success: false, error: 'Harap konfirmasi pembayaran denda sebelum melanjutkan' },
        { status: 400 }
      );
    }

    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      // Update stok equipment (stok kembali bertambah)
      const equipment = ret.loan.equipment;
      const newStock = (equipment.stok || 0) + (ret.loan.jumlah || 0);

      await tx.equipment.update({
        where: { id: equipment.id },
        data: {
          stok: newStock,
          status: newStock > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
        },
      });

      // Update return status: DIKEMBALIKAN (confirmed)
      const retUpdated = await tx.return.update({
        where: { id: ret.id },
        data: {
          received_by: session.user.id,
          confirmed_at: now,
          status: 'DIKEMBALIKAN',
          denda_dibayar: totalDenda > 0 ? totalDenda : 0,
        },
        include: {
          loan: {
            include: {
              equipment: true,
              user: { select: { id: true, first_name: true, last_name: true, email: true, kelas: true } },
            },
          },
          returner: { select: { id: true, first_name: true, last_name: true, email: true, kelas: true } },
          receiver: { select: { id: true, first_name: true, last_name: true, email: true } },
        },
      });

      // Loan tetap RETURNED (sudah dikembalikan), tapi kita bisa pastikan tanggal_kembali ada
      await tx.loan.update({
        where: { id: ret.loan_id },
        data: {
          status: 'RETURNED',
          tanggal_kembali: ret.tanggal_kembali || now,
        },
      });

      return retUpdated;
    });

    return NextResponse.json({ success: true, message: 'Pengembalian berhasil dikonfirmasi', data: updated });
  } catch (error) {
    console.error('Error confirming return:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengkonfirmasi pengembalian', message: error.message },
      { status: 500 }
    );
  }
}


