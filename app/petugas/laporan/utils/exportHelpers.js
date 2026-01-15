import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

/**
 * Export loans data to PDF
 */
export function exportLoansToPDF(loans, dateFrom, dateTo) {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(18);
  doc.text('Laporan Peminjaman', 14, yPos);
  yPos += 10;

  doc.setFontSize(12);
  if (dateFrom || dateTo) {
    doc.text(`Periode: ${dateFrom || 'Awal'} - ${dateTo || 'Akhir'}`, 14, yPos);
    yPos += 8;
  }
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, yPos);
  yPos += 10;

  // Table Header
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('No', 14, yPos);
  doc.text('Peminjam', 24, yPos);
  doc.text('Barang', 70, yPos);
  doc.text('Jumlah', 120, yPos);
  doc.text('Tanggal Pinjam', 140, yPos);
  doc.text('Status', 175, yPos);
  yPos += 7;

  doc.setLineWidth(0.5);
  doc.line(14, yPos, 200, yPos);
  yPos += 5;

  // Table Data
  doc.setFont(undefined, 'normal');
  loans.forEach((loan, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    const user = loan.user;
    const equipment = loan.equipment;
    const peminjam = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '-';
    const barang = equipment?.nama || '-';
    const tanggalPinjam = loan.tanggal_pinjam
      ? new Date(loan.tanggal_pinjam).toLocaleDateString('id-ID')
      : '-';
    const status = loan.status || '-';

    doc.text(String(index + 1), 14, yPos);
    doc.text(peminjam.length > 20 ? peminjam.substring(0, 20) + '...' : peminjam, 24, yPos);
    doc.text(barang.length > 25 ? barang.substring(0, 25) + '...' : barang, 70, yPos);
    doc.text(String(loan.jumlah || '-'), 120, yPos);
    doc.text(tanggalPinjam, 140, yPos);
    doc.text(status, 175, yPos);
    yPos += 7;
  });

  // Footer
  doc.text(`Total: ${loans.length} peminjaman`, 14, yPos + 5);

  // Save PDF
  doc.save(`laporan-peminjaman-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Export returns data to PDF
 */
export function exportReturnsToPDF(returns, dateFrom, dateTo) {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(18);
  doc.text('Laporan Pengembalian', 14, yPos);
  yPos += 10;

  doc.setFontSize(12);
  if (dateFrom || dateTo) {
    doc.text(`Periode: ${dateFrom || 'Awal'} - ${dateTo || 'Akhir'}`, 14, yPos);
    yPos += 8;
  }
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, yPos);
  yPos += 10;

  // Table Header
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('No', 14, yPos);
  doc.text('Peminjam', 24, yPos);
  doc.text('Barang', 70, yPos);
  doc.text('Tanggal', 115, yPos);
  doc.text('Kondisi', 140, yPos);
  doc.text('Denda', 170, yPos);
  yPos += 7;

  doc.setLineWidth(0.5);
  doc.line(14, yPos, 200, yPos);
  yPos += 5;

  // Helper function to format kondisi
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

  // Table Data
  doc.setFont(undefined, 'normal');
  returns.forEach((ret, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    const user = ret.loan?.user || ret.returner;
    const equipment = ret.loan?.equipment;
    const peminjam = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '-';
    const barang = equipment?.nama || '-';
    const tanggalKembali = ret.tanggal_kembali
      ? new Date(ret.tanggal_kembali).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '-';
    const kondisi = formatKondisi(ret.kondisi_alat);
    const denda = ret.total_denda ? `Rp${Number(ret.total_denda).toLocaleString('id-ID')}` : '-';

    doc.text(String(index + 1), 14, yPos);
    doc.text(peminjam.length > 18 ? peminjam.substring(0, 18) + '...' : peminjam, 24, yPos);
    doc.text(barang.length > 22 ? barang.substring(0, 22) + '...' : barang, 70, yPos);
    doc.text(tanggalKembali, 115, yPos);
    doc.text(kondisi.length > 12 ? kondisi.substring(0, 12) : kondisi, 140, yPos);
    doc.text(denda, 170, yPos);
    yPos += 7;
  });

  // Footer
  const totalDenda = returns.reduce((sum, ret) => sum + Number(ret.total_denda || 0), 0);
  doc.text(`Total: ${returns.length} pengembalian`, 14, yPos + 5);
  doc.text(`Total Denda: Rp ${totalDenda.toLocaleString('id-ID')}`, 14, yPos + 12);

  // Save PDF
  doc.save(`laporan-pengembalian-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Export loans data to Excel
 */
export function exportLoansToExcel(loans, dateFrom, dateTo) {
  const data = loans.map((loan, index) => {
    const user = loan.user;
    const equipment = loan.equipment;
    return {
      No: index + 1,
      'Nama Peminjam': user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '-',
      Email: user?.email || '-',
      'Nama Barang': equipment?.nama || '-',
      'Kategori': equipment?.kategori?.nama || '-',
      Jumlah: loan.jumlah || 0,
      'Tanggal Pinjam': loan.tanggal_pinjam
        ? new Date(loan.tanggal_pinjam).toLocaleString('id-ID')
        : '-',
      'Tanggal Deadline': loan.tanggal_deadline
        ? new Date(loan.tanggal_deadline).toLocaleString('id-ID')
        : '-',
      'Tanggal Ambil': loan.tanggal_ambil
        ? new Date(loan.tanggal_ambil).toLocaleString('id-ID')
        : '-',
      Status: loan.status || '-',
      Keterangan: loan.keterangan || '-',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Peminjaman');

  XLSX.writeFile(wb, `laporan-peminjaman-${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Export returns data to Excel
 */
export function exportReturnsToExcel(returns, dateFrom, dateTo) {
  const data = returns.map((ret, index) => {
    const user = ret.loan?.user || ret.returner;
    const equipment = ret.loan?.equipment;
    return {
      No: index + 1,
      'Nama Peminjam': user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '-',
      Email: user?.email || '-',
      'Nama Barang': equipment?.nama || '-',
      'Tanggal Kembali': ret.tanggal_kembali
        ? new Date(ret.tanggal_kembali).toLocaleString('id-ID')
        : '-',
      'Kondisi Alat': ret.kondisi_alat || '-',
      'Denda Telat': ret.denda_telat ? Number(ret.denda_telat) : 0,
      'Denda Kerusakan': ret.denda_kerusakan ? Number(ret.denda_kerusakan) : 0,
      'Total Denda': ret.total_denda ? Number(ret.total_denda) : 0,
      Status: ret.status || '-',
      Catatan: ret.catatan || '-',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Pengembalian');

  XLSX.writeFile(wb, `laporan-pengembalian-${new Date().toISOString().split('T')[0]}.xlsx`);
}

