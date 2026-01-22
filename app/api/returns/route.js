import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const CONDITION_PERCENT = {
  BAIK: 0,
  RUSAK_RINGAN: 0.15,
  RUSAK_SEDANG: 0.4,
  RUSAK_BERAT: 0.7,
  HILANG: 1.0,
};

// GET /api/returns - List returns (PETUGAS/ADMIN)
export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!['PETUGAS', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // MENUNGGU_PEMBAYARAN | DIKEMBALIKAN

    const where = {};
    if (status && ['MENUNGGU_PEMBAYARAN', 'DIKEMBALIKAN'].includes(status)) {
      where.status = status;
    }

    const returns = await prisma.return.findMany({
      where,
      include: {
        loan: {
          include: {
            equipment: {
              include: {
                kategori: { select: { id: true, nama: true } },
              },
            },
            user: {
              select: { id: true, first_name: true, last_name: true, email: true, kelas: true },
            },
          },
        },
        returner: {
          select: { id: true, first_name: true, last_name: true, email: true, kelas: true },
        },
        receiver: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, data: returns });
  } catch (error) {
    console.error('Error fetching returns:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pengembalian', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/returns - Create return (Peminjam only)
export async function POST(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PEMINJAM') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Hanya peminjam yang bisa mengembalikan barang' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { loan_id, kondisi_alat, catatan, foto_bukti } = body;

    if (!loan_id) {
      return NextResponse.json({ success: false, error: 'loan_id wajib diisi' }, { status: 400 });
    }
    if (!kondisi_alat || !Object.keys(CONDITION_PERCENT).includes(kondisi_alat)) {
      return NextResponse.json({ success: false, error: 'kondisi_alat tidak valid' }, { status: 400 });
    }

    const loan = await prisma.loan.findUnique({
      where: { id: loan_id },
      include: {
        equipment: true,
        return: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            kelas: true,
          },
        },
      },
    });

    if (!loan) {
      return NextResponse.json({ success: false, error: 'Loan tidak ditemukan' }, { status: 404 });
    }

    if (loan.user_id !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (loan.status !== 'BORROWED') {
      return NextResponse.json(
        { success: false, error: 'Hanya loan dengan status BORROWED yang bisa dikembalikan' },
        { status: 400 }
      );
    }

    if (loan.return) {
      return NextResponse.json(
        { success: false, error: 'Pengembalian untuk loan ini sudah pernah diajukan' },
        { status: 400 }
      );
    }

    // Hitung denda telat (simple: 50k per hari telat)
    const deadline = new Date(loan.tanggal_deadline);
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const lateDays = Math.max(0, Math.ceil((now.getTime() - deadline.getTime()) / msPerDay));
    const dendaTelat = lateDays * 50000;

    // Hitung denda kerusakan berdasarkan harga_alat * persentase
    const hargaAlat = loan.equipment?.harga_alat ? Number(loan.equipment.harga_alat) : 0;
    const persentase = CONDITION_PERCENT[kondisi_alat] ?? 0;
    const dendaKerusakan = hargaAlat * persentase;

    const totalDenda = dendaTelat + dendaKerusakan;

    const result = await prisma.$transaction(async (tx) => {
      // Create return
      const ret = await tx.return.create({
        data: {
          loan_id: loan.id,
          returned_by: session.user.id,
          received_by: null,
          kondisi_alat,
          catatan: catatan?.trim() || null,
          foto_bukti: foto_bukti?.trim() || null,
          denda_telat: dendaTelat,
          denda_kerusakan: dendaKerusakan,
          persentase_kerusakan: persentase,
          total_denda: totalDenda,
          status: 'MENUNGGU_PEMBAYARAN',
          tanggal_kembali: now,
        },
        include: {
          loan: {
            include: {
              equipment: {
                include: {
                  kategori: {
                    select: { id: true, nama: true },
                  },
                },
              },
              user: {
                select: { id: true, first_name: true, last_name: true, email: true, kelas: true },
              },
            },
          },
          returner: {
            select: { id: true, first_name: true, last_name: true, email: true, kelas: true },
          },
        },
      });

      // Update loan status & tanggal_kembali
      await tx.loan.update({
        where: { id: loan.id },
        data: {
          status: 'RETURNED',
          tanggal_kembali: now,
        },
      });

      // Buat notifikasi untuk semua petugas/admin
      try {
        const petugasAdmins = await tx.user.findMany({
          where: {
            role: {
              in: ['PETUGAS', 'ADMIN'],
            },
            is_active: true,
          },
          select: { id: true },
        });

        if (petugasAdmins.length > 0) {
          const borrowerName = `${loan.user?.first_name || ''} ${loan.user?.last_name || ''}`.trim() || 'Peminjam';
          const equipmentName = loan.equipment?.nama || 'Barang';

          // Notifikasi pengembalian barang
          const returnNotifications = petugasAdmins.map((user) => ({
            user_id: user.id,
            type: 'RETURN_SUBMITTED',
            title: 'Pengembalian Barang Baru',
            message: `${borrowerName} telah mengembalikan ${equipmentName}. Silakan konfirmasi pengembalian.`,
            loan_id: loan.id,
            return_id: ret.id,
            is_read: false,
          }));

          if (returnNotifications.length > 0) {
            await tx.notification.createMany({
              data: returnNotifications,
            });
          }

          // Jika telat, buat notifikasi khusus untuk telat
          if (lateDays > 0) {
            const lateNotifications = petugasAdmins.map((user) => ({
              user_id: user.id,
              type: 'RETURN_LATE',
              title: 'Pengembalian Telat',
              message: `${borrowerName} mengembalikan ${equipmentName} dengan keterlambatan ${lateDays} hari. Denda telat: Rp ${dendaTelat.toLocaleString('id-ID')}.`,
              loan_id: loan.id,
              return_id: ret.id,
              is_read: false,
            }));

            if (lateNotifications.length > 0) {
              await tx.notification.createMany({
                data: lateNotifications,
              });
            }
          }
        }
      } catch (notifError) {
        // Log error tapi jangan gagalkan transaction jika notifikasi gagal
        console.error('Error creating notifications:', notifError);
        // Lanjutkan tanpa notifikasi
      }

      // NOTE: stok akan ditambahkan setelah petugas menerima & konfirmasi pengembalian (belum dibuat)
      return ret;
    });

    return NextResponse.json(
      { success: true, message: 'Pengembalian berhasil diajukan, menunggu konfirmasi petugas', data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating return:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengajukan pengembalian', message: error.message },
      { status: 500 }
    );
  }
}


