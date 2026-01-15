/**
 * Helper untuk membuat table options dari availableTables
 */
export const getTableOptions = (availableTables = []) => {
  const tableLabelMap = {
    users: 'User',
    equipment: 'Alat',
    loans: 'Peminjaman',
    returns: 'Pengembalian',
    categories: 'Kategori',
    registration_codes: 'Kode Registrasi',
    articles: 'Artikel',
  };

  return [
    { value: 'ALL', label: 'Semua Tabel' },
    ...availableTables.map((table) => ({
      value: table,
      label: tableLabelMap[table] || table,
    })),
  ];
};


