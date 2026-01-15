'use client';

import { FileText, Download, FileSpreadsheet, Calendar, Filter } from 'lucide-react';
import Button from '@/components/button';
import Input from '@/components/forminput';
import FilterSelect from '@/components/filterSelect';
import { useLaporan } from './hooks/useLaporan';
import { exportLoansToPDF, exportReturnsToPDF, exportLoansToExcel, exportReturnsToExcel } from './utils/exportHelpers';
import { reportTypeOptions } from '@/helper/laporanOptions';

export default function LaporanPage() {
  const {
    loading,
    loans,
    returns,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    reportType,
    setReportType,
  } = useLaporan();

  const handleExportPDF = () => {
    if (reportType === 'LOANS' || reportType === 'ALL') {
      if (loans.length > 0) {
        exportLoansToPDF(loans, dateFrom, dateTo);
      }
    }
    if (reportType === 'RETURNS' || reportType === 'ALL') {
      if (returns.length > 0) {
        exportReturnsToPDF(returns, dateFrom, dateTo);
      }
    }
  };

  const handleExportExcel = () => {
    if (reportType === 'LOANS' || reportType === 'ALL') {
      if (loans.length > 0) {
        exportLoansToExcel(loans, dateFrom, dateTo);
      }
    }
    if (reportType === 'RETURNS' || reportType === 'ALL') {
      if (returns.length > 0) {
        exportReturnsToExcel(returns, dateFrom, dateTo);
      }
    }
  };

  const totalData = reportType === 'LOANS' ? loans.length : reportType === 'RETURNS' ? returns.length : loans.length + returns.length;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500 font-semibold">
            Petugas • Laporan
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Laporan Peminjaman & Pengembalian
          </h1>
          <p className="text-base text-gray-600 max-w-3xl">
            Lihat dan export data laporan peminjaman dan pengembalian dalam format PDF atau Excel.
          </p>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Laporan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Laporan
              </label>
              <FilterSelect
                value={reportType}
                onChange={(val) => setReportType(val)}
                options={reportTypeOptions}
                placeholder="Pilih Jenis Laporan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dari Tanggal
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sampai Tanggal
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>
        </div>

        {/* Stats & Export Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-4">
            <div className="text-2xl font-bold text-gray-900">{totalData}</div>
            <div className="text-sm text-gray-500">Total Data</div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={loading || totalData === 0}
              className="flex items-center gap-2"
            >
              <FileText size={16} />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={loading || totalData === 0}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Data Preview */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-500">Memuat data laporan...</div>
          </div>
        ) : totalData === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {dateFrom || dateTo
                ? 'Tidak ada data untuk periode yang dipilih'
                : 'Belum ada data untuk ditampilkan'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preview Data ({totalData} item)
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              {reportType === 'LOANS' || reportType === 'ALL' ? (
                <div>
                  <p className="font-semibold">Peminjaman: {loans.length} item</p>
                </div>
              ) : null}
              {reportType === 'RETURNS' || reportType === 'ALL' ? (
                <div>
                  <p className="font-semibold">Pengembalian: {returns.length} item</p>
                </div>
              ) : null}
              <p className="text-xs text-gray-500 mt-4">
                Klik tombol Export PDF atau Export Excel di atas untuk mengunduh laporan lengkap.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

