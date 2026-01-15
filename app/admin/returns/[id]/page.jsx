'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  Clock,
  CheckCircle,
  Package,
  User,
  Mail,
  Calendar,
  DollarSign,
  FileText,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import Button from '@/components/button';
import { returnsAPI } from '@/lib/api/returns';
import { useToast } from '@/components/ToastProvider';

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getKondisiLabel(kondisi) {
  const labels = {
    'BAIK': 'Baik',
    'RUSAK_RINGAN': 'Rusak Ringan',
    'RUSAK_SEDANG': 'Rusak Sedang',
    'RUSAK_BERAT': 'Rusak Berat',
    'HILANG': 'Hilang'
  };
  return labels[kondisi] || kondisi;
}

function getKondisiColor(kondisi) {
  const colors = {
    'BAIK': 'bg-green-50 text-green-700 border-green-200',
    'RUSAK_RINGAN': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'RUSAK_SEDANG': 'bg-orange-50 text-orange-700 border-orange-200',
    'RUSAK_BERAT': 'bg-red-50 text-red-700 border-red-200',
    'HILANG': 'bg-red-100 text-red-800 border-red-300'
  };
  return colors[kondisi] || 'bg-gray-50 text-gray-700 border-gray-200';
}

export default function AdminReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const returnId = params.id;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [returnData, setReturnData] = useState(null);

  useEffect(() => {
    const fetchReturn = async () => {
      try {
        setLoading(true);
        const res = await returnsAPI.getById(returnId);
        if (res.success) {
          setReturnData(res.data);
        } else {
          toast.error(res.error || 'Gagal memuat detail pengembalian');
        }
      } catch (e) {
        console.error('Error fetching return detail:', e);
        toast.error('Gagal memuat detail pengembalian');
      } finally {
        setLoading(false);
      }
    };

    if (returnId) {
      fetchReturn();
    }
  }, [returnId, toast]);

  const mappedData = useMemo(() => {
    if (!returnData) return null;

    const loan = returnData.loan;
    const equipment = loan?.equipment;
    const user = loan?.user || returnData.returner;
    const image =
      equipment?.gambar && equipment.gambar.startsWith('/')
        ? equipment.gambar
        : equipment?.gambar
          ? `/uploads/${equipment.gambar}`
          : null;

    return {
      id: returnData.id,
      status: returnData.status,
      tanggal_kembali: formatDate(returnData.tanggal_kembali),
      confirmed_at: returnData.confirmed_at ? formatDate(returnData.confirmed_at) : null,
      kondisi_alat: returnData.kondisi_alat,
      kondisi_label: getKondisiLabel(returnData.kondisi_alat),
      kondisi_color: getKondisiColor(returnData.kondisi_alat),
      catatan: returnData.catatan,
      foto_bukti: returnData.foto_bukti,
      denda_telat: Number(returnData.denda_telat || 0),
      denda_kerusakan: Number(returnData.denda_kerusakan || 0),
      total_denda: Number(returnData.total_denda || 0),
      denda_dibayar: Number(returnData.denda_dibayar || 0),
      persentase_kerusakan: Number(returnData.persentase_kerusakan || 0),
      peminjam: {
        id: user?.id,
        name: user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '—',
        email: user?.email || '—',
        kelas: user?.kelas || null,
        no_hp: user?.no_hp || null,
        alamat: user?.alamat || null,
      },
      equipment: {
        id: equipment?.id,
        name: equipment?.nama || '—',
        jumlah: loan?.jumlah || 0,
        image,
        kode_alat: equipment?.kode_alat || null,
        kategori: equipment?.kategori?.nama || 'Lainnya',
        deskripsi: equipment?.deskripsi || 'Tidak ada deskripsi',
        harga_alat: equipment?.harga_alat ? Number(equipment.harga_alat) : 0,
      },
      loan: {
        id: loan?.id,
        tanggal_pinjam: loan?.tanggal_pinjam ? formatDate(loan.tanggal_pinjam) : null,
        tanggal_deadline: loan?.tanggal_deadline ? formatDate(loan.tanggal_deadline) : null,
        tanggal_ambil: loan?.tanggal_ambil ? formatDate(loan.tanggal_ambil) : null,
        keterangan: loan?.keterangan || null,
      },
      receiver: returnData.receiver
        ? `${returnData.receiver.first_name ?? ''} ${returnData.receiver.last_name ?? ''}`.trim()
        : null,
    };
  }, [returnData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  if (!mappedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Data pengembalian tidak ditemukan</p>
          <Button onClick={() => router.push('/admin/returns')}>
            Kembali ke Daftar Pengembalian
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig =
    mappedData.status === 'MENUNGGU_PEMBAYARAN'
      ? {
          label: 'Menunggu Konfirmasi',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock size={20} />,
          description: 'Pengembalian sedang menunggu konfirmasi dari petugas',
        }
      : {
          label: 'Sudah Dikonfirmasi',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle size={20} />,
          description: 'Pengembalian sudah dikonfirmasi oleh petugas',
        };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/returns')}>
            <ArrowLeft size={16} className="mr-2" />
            Kembali
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-1">
              Admin • Detail Pengembalian
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">Detail Pengembalian</h1>
          </div>
        </div>

        {/* Status Card */}
        <div className={`rounded-lg border p-6 ${statusConfig.color}`}>
          <div className="flex items-start gap-4">
            {statusConfig.icon}
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">{statusConfig.label}</h2>
              <p className="text-sm opacity-90">{statusConfig.description}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Equipment Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={20} />
                Informasi Barang
              </h3>
              <div className="space-y-4">
                {mappedData.equipment.image && (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={mappedData.equipment.image}
                      alt={mappedData.equipment.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/image/cat.jpg';
                      }}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Nama Barang</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{mappedData.equipment.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Kategori</label>
                    <p className="text-sm text-gray-700 mt-1">{mappedData.equipment.kategori}</p>
                  </div>
                  {mappedData.equipment.kode_alat && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Kode Alat</label>
                      <p className="text-sm text-gray-700 mt-1">{mappedData.equipment.kode_alat}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Jumlah</label>
                    <p className="text-sm text-gray-700 mt-1">{mappedData.equipment.jumlah} unit</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Deskripsi</label>
                    <p className="text-sm text-gray-700 mt-1">{mappedData.equipment.deskripsi}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Borrower Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} />
                Informasi Peminjam
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Nama</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{mappedData.peminjam.name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                  <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    {mappedData.peminjam.email}
                  </p>
                </div>
                {mappedData.peminjam.kelas && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Kelas</label>
                    <p className="text-sm text-gray-700 mt-1">{mappedData.peminjam.kelas}</p>
                  </div>
                )}
                {mappedData.peminjam.no_hp && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">No. HP</label>
                    <p className="text-sm text-gray-700 mt-1">{mappedData.peminjam.no_hp}</p>
                  </div>
                )}
                {mappedData.peminjam.alamat && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Alamat</label>
                    <p className="text-sm text-gray-700 mt-1">{mappedData.peminjam.alamat}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Return Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <RotateCcw size={20} />
                Detail Pengembalian
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <Calendar size={14} />
                    Tanggal Kembali
                  </label>
                  <p className="text-sm text-gray-700 mt-1">{mappedData.tanggal_kembali}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Kondisi Alat</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${mappedData.kondisi_color}`}
                    >
                      {mappedData.kondisi_label}
                    </span>
                  </p>
                </div>
                {mappedData.catatan && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Catatan</label>
                    <p className="text-sm text-gray-700 mt-1">{mappedData.catatan}</p>
                  </div>
                )}
                {mappedData.foto_bukti && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                      Foto Bukti
                    </label>
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={
                          mappedData.foto_bukti.startsWith('/')
                            ? mappedData.foto_bukti
                            : `/uploads/returns/${mappedData.foto_bukti}`
                        }
                        alt="Bukti pengembalian"
                        className="w-full h-auto"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Loan Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Detail Peminjaman
              </h3>
              <div className="space-y-3">
                {mappedData.loan.tanggal_pinjam && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Tanggal Pinjam</label>
                    <p className="text-sm text-gray-700 mt-1">{mappedData.loan.tanggal_pinjam}</p>
                  </div>
                )}
                {mappedData.loan.tanggal_deadline && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Deadline</label>
                    <p className="text-sm text-gray-700 mt-1">{mappedData.loan.tanggal_deadline}</p>
                  </div>
                )}
                {mappedData.loan.tanggal_ambil && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Tanggal Ambil</label>
                    <p className="text-sm text-gray-700 mt-1">{mappedData.loan.tanggal_ambil}</p>
                  </div>
                )}
                {mappedData.loan.keterangan && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Keterangan</label>
                    <p className="text-sm text-gray-700 mt-1">{mappedData.loan.keterangan}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fine Details */}
            {mappedData.total_denda > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign size={20} />
                  Detail Denda
                </h3>
                <div className="space-y-3">
                  {mappedData.denda_telat > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Denda Keterlambatan</label>
                      <p className="text-sm font-medium text-red-600 mt-1">
                        Rp {mappedData.denda_telat.toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                  {mappedData.denda_kerusakan > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">
                        Denda Kerusakan ({mappedData.persentase_kerusakan * 100}%)
                      </label>
                      <p className="text-sm font-medium text-red-600 mt-1">
                        Rp {mappedData.denda_kerusakan.toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Total Denda</label>
                    <p className="text-lg font-bold text-red-600 mt-1">
                      Rp {mappedData.total_denda.toLocaleString('id-ID')}
                    </p>
                  </div>
                  {mappedData.denda_dibayar > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Denda Dibayar</label>
                      <p className="text-sm font-medium text-green-600 mt-1">
                        Rp {mappedData.denda_dibayar.toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Receiver Info */}
            {mappedData.status === 'DIKEMBALIKAN' && mappedData.receiver && (
              <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-6">
                <h3 className="text-lg font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Dikonfirmasi Oleh
                </h3>
                <p className="text-sm text-emerald-800 mb-2">{mappedData.receiver}</p>
                {mappedData.confirmed_at && (
                  <p className="text-xs text-emerald-700">Pada: {mappedData.confirmed_at}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


