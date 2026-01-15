/**
 * Helper functions untuk formatting tanggal
 */

/**
 * Format tanggal dengan waktu dalam format Indonesia
 * @param {string|Date} dateString - String tanggal atau Date object
 * @returns {string} Tanggal yang sudah diformat dalam format Indonesia
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format tanggal tanpa waktu dalam format Indonesia
 * @param {string|Date} dateString - String tanggal atau Date object
 * @returns {string} Tanggal yang sudah diformat tanpa waktu
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Format tanggal dengan waktu lengkap (termasuk detik) dalam format Indonesia
 * @param {string|Date} dateString - String tanggal atau Date object
 * @returns {string} Tanggal yang sudah diformat dengan waktu lengkap
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

