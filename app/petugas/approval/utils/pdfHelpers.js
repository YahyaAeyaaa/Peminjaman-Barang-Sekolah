import jsPDF from 'jspdf';

/**
 * Generate PDF bukti pengajuan peminjaman (setelah approve)
 * PDF ini digunakan sebagai bukti untuk peminjam bawa ke petugas saat mengambil barang
 */
export function generateBuktiPengajuanPDF(loan) {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('BUKTI PENGAJUAN PEMINJAMAN', 105, yPos, { align: 'center' });
  yPos += 15;

  // Garis pemisah
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  // Informasi Peminjam
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Informasi Peminjam', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const user = loan.user || {};
  const peminjamName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || '-';
  doc.text(`Nama: ${peminjamName}`, 25, yPos);
  yPos += 6;
  doc.text(`Email: ${user.email || '-'}`, 25, yPos);
  yPos += 10;

  // Informasi Barang
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Informasi Barang', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const equipment = loan.equipment || {};
  doc.text(`Nama Barang: ${equipment.nama || '-'}`, 25, yPos);
  yPos += 6;
  doc.text(`Kategori: ${equipment.kategori?.nama || '-'}`, 25, yPos);
  yPos += 6;
  doc.text(`Jumlah: ${loan.jumlah || 0} unit`, 25, yPos);
  yPos += 10;

  // Informasi Peminjaman
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Informasi Peminjaman', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const tanggalPinjam = loan.tanggal_pinjam
    ? new Date(loan.tanggal_pinjam).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-';
  doc.text(`Tanggal Pengajuan: ${tanggalPinjam}`, 25, yPos);
  yPos += 6;

  const approvedAt = loan.approved_at
    ? new Date(loan.approved_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-';
  doc.text(`Tanggal Disetujui: ${approvedAt}`, 25, yPos);
  yPos += 6;

  const batasWaktuAmbil = loan.batas_waktu_ambil
    ? new Date(loan.batas_waktu_ambil).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-';
  doc.text(`Batas Waktu Ambil: ${batasWaktuAmbil}`, 25, yPos);
  yPos += 6;

  const tanggalDeadline = loan.tanggal_deadline
    ? new Date(loan.tanggal_deadline).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-';
  doc.text(`Deadline Pengembalian: ${tanggalDeadline}`, 25, yPos);
  yPos += 10;

  if (loan.keterangan) {
    doc.text(`Keterangan: ${loan.keterangan}`, 25, yPos);
    yPos += 10;
  }

  // Status
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Status', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text('DISETUJUI - Menunggu Pengambilan Barang', 25, yPos);
  yPos += 15;

  // Catatan
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Catatan: Bawa bukti ini saat mengambil barang ke petugas.', 20, yPos);
  yPos += 6;
  doc.text('Barang harus diambil sebelum batas waktu yang ditentukan.', 20, yPos);
  yPos += 15;

  // Footer
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const now = new Date();
  doc.text(
    `Dicetak pada: ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`,
    105,
    280,
    { align: 'center' }
  );

  // Save PDF
  const filename = `bukti-pengajuan-${loan.id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Generate PDF bukti peminjaman (setelah confirm take)
 * PDF ini digunakan sebagai bukti resmi bahwa barang sudah diambil
 */
export function generateBuktiPeminjamanPDF(loan) {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('BUKTI PEMINJAMAN', 105, yPos, { align: 'center' });
  yPos += 15;

  // Garis pemisah
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  // Informasi Peminjam
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Informasi Peminjam', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const user = loan.user || {};
  const peminjamName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || '-';
  doc.text(`Nama: ${peminjamName}`, 25, yPos);
  yPos += 6;
  doc.text(`Email: ${user.email || '-'}`, 25, yPos);
  yPos += 10;

  // Informasi Barang
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Informasi Barang', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const equipment = loan.equipment || {};
  doc.text(`Nama Barang: ${equipment.nama || '-'}`, 25, yPos);
  yPos += 6;
  doc.text(`Kategori: ${equipment.kategori?.nama || '-'}`, 25, yPos);
  yPos += 6;
  doc.text(`Jumlah: ${loan.jumlah || 0} unit`, 25, yPos);
  yPos += 10;

  // Informasi Peminjaman
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Informasi Peminjaman', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const tanggalPinjam = loan.tanggal_pinjam
    ? new Date(loan.tanggal_pinjam).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-';
  doc.text(`Tanggal Pengajuan: ${tanggalPinjam}`, 25, yPos);
  yPos += 6;

  const approvedAt = loan.approved_at
    ? new Date(loan.approved_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-';
  doc.text(`Tanggal Disetujui: ${approvedAt}`, 25, yPos);
  yPos += 6;

  const tanggalAmbil = loan.tanggal_ambil
    ? new Date(loan.tanggal_ambil).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';
  doc.text(`Tanggal Pengambilan: ${tanggalAmbil}`, 25, yPos);
  yPos += 6;

  const tanggalDeadline = loan.tanggal_deadline
    ? new Date(loan.tanggal_deadline).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-';
  doc.text(`Deadline Pengembalian: ${tanggalDeadline}`, 25, yPos);
  yPos += 10;

  if (loan.keterangan) {
    doc.text(`Keterangan: ${loan.keterangan}`, 25, yPos);
    yPos += 10;
  }

  // Status
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Status', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text('BARANG SUDAH DIAMBIL', 25, yPos);
  yPos += 15;

  // Catatan
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Catatan: Barang harus dikembalikan sebelum atau pada tanggal deadline.', 20, yPos);
  yPos += 6;
  doc.text('Keterlambatan pengembalian akan dikenakan denda sesuai ketentuan.', 20, yPos);
  yPos += 15;

  // Footer
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const now = new Date();
  doc.text(
    `Dicetak pada: ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`,
    105,
    280,
    { align: 'center' }
  );

  // Save PDF
  const filename = `bukti-peminjaman-${loan.id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Generate PDF bukti pengembalian barang
 * PDF ini digunakan sebagai bukti bahwa barang sudah dikembalikan dan diterima oleh petugas
 */
export function generateBuktiPengembalianPDF(returnData) {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('BUKTI PENGEMBALIAN BARANG', 105, yPos, { align: 'center' });
  yPos += 15;

  // Garis pemisah
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  // Informasi Peminjam
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Informasi Peminjam', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const user = returnData.loan?.user || returnData.returner || {};
  const peminjamName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || '-';
  doc.text(`Nama: ${peminjamName}`, 25, yPos);
  yPos += 6;
  doc.text(`Email: ${user.email || '-'}`, 25, yPos);
  yPos += 6;
  if (user.kelas) {
    doc.text(`Kelas: ${user.kelas}`, 25, yPos);
    yPos += 6;
  }
  yPos += 4;

  // Informasi Barang
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Informasi Barang', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const equipment = returnData.loan?.equipment || {};
  const loan = returnData.loan || {};
  doc.text(`Nama Barang: ${equipment.nama || '-'}`, 25, yPos);
  yPos += 6;
  doc.text(`Jumlah: ${loan.jumlah || returnData.loan?.jumlah || 0} unit`, 25, yPos);
  yPos += 6;
  
  // Format kondisi
  const formatKondisi = (kondisi) => {
    const labels = {
      'BAIK': 'Baik',
      'RUSAK_RINGAN': 'Rusak Ringan',
      'RUSAK_SEDANG': 'Rusak Sedang',
      'RUSAK_BERAT': 'Rusak Berat',
      'HILANG': 'Hilang'
    };
    return labels[kondisi] || kondisi || '-';
  };
  
  doc.text(`Kondisi Saat Dikembalikan: ${formatKondisi(returnData.kondisi_alat)}`, 25, yPos);
  yPos += 10;

  // Informasi Pengembalian
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Informasi Pengembalian', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const tanggalKembali = returnData.tanggal_kembali
    ? new Date(returnData.tanggal_kembali).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';
  doc.text(`Tanggal Pengembalian: ${tanggalKembali}`, 25, yPos);
  yPos += 6;

  const confirmedAt = returnData.confirmed_at
    ? new Date(returnData.confirmed_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';
  doc.text(`Tanggal Dikonfirmasi: ${confirmedAt}`, 25, yPos);
  yPos += 6;

  const receiver = returnData.receiver || {};
  const receiverName = `${receiver.first_name || ''} ${receiver.last_name || ''}`.trim() || '-';
  doc.text(`Diterima oleh: ${receiverName}`, 25, yPos);
  yPos += 10;

  if (returnData.catatan) {
    doc.text(`Catatan: ${returnData.catatan}`, 25, yPos);
    yPos += 10;
  }

  // Denda (jika ada)
  const totalDenda = Number(returnData.total_denda || returnData.denda_dibayar || 0);
  if (totalDenda > 0) {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Detail Denda', 20, yPos);
    yPos += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    const dendaTelat = Number(returnData.denda_telat || 0);
    const dendaKerusakan = Number(returnData.denda_kerusakan || 0);
    
    if (dendaTelat > 0) {
      doc.text(`Denda Keterlambatan: Rp ${dendaTelat.toLocaleString('id-ID')}`, 25, yPos);
      yPos += 6;
    }
    
    if (dendaKerusakan > 0) {
      doc.text(`Denda Kerusakan: Rp ${dendaKerusakan.toLocaleString('id-ID')}`, 25, yPos);
      yPos += 6;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text(`Total Denda yang Dibayar: Rp ${totalDenda.toLocaleString('id-ID')}`, 25, yPos);
    yPos += 10;
  } else {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 128, 0);
    doc.text('✓ Tidak ada denda', 25, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;
  }

  // Status
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Status', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text('BARANG SUDAH DIKEMBALIKAN DAN DIKONFIRMASI', 25, yPos);
  yPos += 15;

  // Catatan
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Catatan: Bukti ini menyatakan bahwa barang telah dikembalikan dan diterima oleh petugas.', 20, yPos);
  yPos += 6;
  if (totalDenda > 0) {
    doc.text('Denda telah dibayar lunas sesuai dengan ketentuan yang berlaku.', 20, yPos);
    yPos += 6;
  }
  yPos += 9;

  // Footer
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const now = new Date();
  doc.text(
    `Dicetak pada: ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`,
    105,
    280,
    { align: 'center' }
  );

  // Save PDF
  const filename = `bukti-pengembalian-${returnData.id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Generate PDF bukti pengajuan pengembalian (dari sisi peminjam)
 * PDF ini digunakan sebagai bukti bahwa peminjam sudah mengajukan pengembalian barang
 */
export function generateBuktiPengajuanPengembalianPDF(returnData, loanData) {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('BUKTI PENGAJUAN PENGEMBALIAN BARANG', 105, yPos, { align: 'center' });
  yPos += 15;

  // Garis pemisah
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  // Informasi Peminjam
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Informasi Peminjam', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const user = loanData?.user || returnData?.loan?.user || {};
  const peminjamName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || '-';
  doc.text(`Nama: ${peminjamName}`, 25, yPos);
  yPos += 6;
  doc.text(`Email: ${user.email || '-'}`, 25, yPos);
  yPos += 6;
  if (user.kelas) {
    doc.text(`Kelas: ${user.kelas}`, 25, yPos);
    yPos += 6;
  }
  yPos += 4;

  // Informasi Barang
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Informasi Barang', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const equipment = loanData?.equipment || returnData?.loan?.equipment || {};
  const loan = loanData || returnData?.loan || {};
  doc.text(`Nama Barang: ${equipment.nama || '-'}`, 25, yPos);
  yPos += 6;
  doc.text(`Jumlah: ${loan.jumlah || 0} unit`, 25, yPos);
  yPos += 6;
  
  // Format kondisi
  const formatKondisi = (kondisi) => {
    const labels = {
      'BAIK': 'Baik',
      'RUSAK_RINGAN': 'Rusak Ringan',
      'RUSAK_SEDANG': 'Rusak Sedang',
      'RUSAK_BERAT': 'Rusak Berat',
      'HILANG': 'Hilang'
    };
    return labels[kondisi] || kondisi || '-';
  };
  
  doc.text(`Kondisi Saat Dikembalikan: ${formatKondisi(returnData.kondisi_alat)}`, 25, yPos);
  yPos += 10;

  // Informasi Pengembalian
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Informasi Pengembalian', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const tanggalKembali = returnData.tanggal_kembali
    ? new Date(returnData.tanggal_kembali).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';
  doc.text(`Tanggal Pengajuan Pengembalian: ${tanggalKembali}`, 25, yPos);
  yPos += 6;

  const tanggalPinjam = loan.tanggal_pinjam
    ? new Date(loan.tanggal_pinjam).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-';
  doc.text(`Tanggal Peminjaman: ${tanggalPinjam}`, 25, yPos);
  yPos += 6;

  const tanggalDeadline = loan.tanggal_deadline
    ? new Date(loan.tanggal_deadline).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-';
  doc.text(`Deadline Pengembalian: ${tanggalDeadline}`, 25, yPos);
  yPos += 10;

  if (returnData.catatan) {
    doc.text(`Catatan: ${returnData.catatan}`, 25, yPos);
    yPos += 10;
  }

  // Estimasi Denda (jika ada)
  const totalDenda = Number(returnData.total_denda || returnData.denda_telat + returnData.denda_kerusakan || 0);
  if (totalDenda > 0 || returnData.denda_telat > 0 || returnData.denda_kerusakan > 0) {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Estimasi Denda', 20, yPos);
    yPos += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    const dendaTelat = Number(returnData.denda_telat || 0);
    const dendaKerusakan = Number(returnData.denda_kerusakan || 0);
    
    if (dendaTelat > 0) {
      doc.text(`Denda Keterlambatan: Rp ${dendaTelat.toLocaleString('id-ID')}`, 25, yPos);
      yPos += 6;
    }
    
    if (dendaKerusakan > 0) {
      doc.text(`Denda Kerusakan: Rp ${dendaKerusakan.toLocaleString('id-ID')}`, 25, yPos);
      yPos += 6;
    }
    
    if (totalDenda > 0) {
      doc.setFont(undefined, 'bold');
      doc.text(`Total Estimasi Denda: Rp ${totalDenda.toLocaleString('id-ID')}`, 25, yPos);
      yPos += 10;
    }
  } else {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 128, 0);
    doc.text('✓ Tidak ada denda', 25, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;
  }

  // Status
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Status', 20, yPos);
  yPos += 8;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text('MENUNGGU KONFIRMASI PETUGAS', 25, yPos);
  yPos += 15;

  // Catatan
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Catatan: Bukti ini menyatakan bahwa kamu telah mengajukan pengembalian barang.', 20, yPos);
  yPos += 6;
  doc.text('Silakan tunggu konfirmasi dari petugas. Jika ada denda, harap siapkan pembayaran.', 20, yPos);
  yPos += 9;

  // Footer
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  const now = new Date();
  doc.text(
    `Dicetak pada: ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`,
    105,
    280,
    { align: 'center' }
  );

  // Save PDF
  const filename = `bukti-pengajuan-pengembalian-${returnData.id ? returnData.id.substring(0, 8) : 'new'}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

