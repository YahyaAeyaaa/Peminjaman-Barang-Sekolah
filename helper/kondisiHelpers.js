/**
 * Helper functions untuk kondisi alat
 */

/**
 * Mendapatkan label kondisi alat dalam bahasa Indonesia
 * @param {string} kondisi - Kode kondisi (BAIK, RUSAK_RINGAN, RUSAK_SEDANG, RUSAK_BERAT, HILANG)
 * @returns {string} Label kondisi dalam bahasa Indonesia
 */
export const getKondisiLabel = (kondisi) => {
  const labels = {
    'BAIK': 'Baik',
    'RUSAK_RINGAN': 'Rusak Ringan',
    'RUSAK_SEDANG': 'Rusak Sedang',
    'RUSAK_BERAT': 'Rusak Berat',
    'HILANG': 'Hilang'
  };
  return labels[kondisi] || kondisi;
};

/**
 * Mendapatkan class Tailwind CSS untuk styling kondisi alat
 * @param {string} kondisi - Kode kondisi (BAIK, RUSAK_RINGAN, RUSAK_SEDANG, RUSAK_BERAT, HILANG)
 * @returns {string} Class Tailwind CSS untuk styling
 */
export const getKondisiColor = (kondisi) => {
  const colors = {
    'BAIK': 'bg-green-50 text-green-700 border-green-200',
    'RUSAK_RINGAN': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'RUSAK_SEDANG': 'bg-orange-50 text-orange-700 border-orange-200',
    'RUSAK_BERAT': 'bg-red-50 text-red-700 border-red-200',
    'HILANG': 'bg-red-100 text-red-800 border-red-300'
  };
  return colors[kondisi] || 'bg-gray-50 text-gray-700 border-gray-200';
};

