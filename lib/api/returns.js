import api from './index';

/**
 * Returns API
 */
export const returnsAPI = {
  /**
   * Get all returns (PETUGAS/ADMIN)
   * @param {Object} params
   * @param {string} params.status - MENUNGGU_PEMBAYARAN | DIKEMBALIKAN
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const qs = queryParams.toString();
    return api.get(`/returns${qs ? `?${qs}` : ''}`);
  },

  /**
   * Get return by ID (PETUGAS/ADMIN)
   * @param {string} id - Return ID
   */
  getById: async (id) => {
    return api.get(`/returns/${id}`);
  },

  /**
   * Upload foto bukti pengembalian
   * @param {File} file
   */
  uploadProof: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/returns/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Create return
   * @param {Object} data
   * @param {string} data.loan_id
   * @param {string} data.kondisi_alat
   * @param {string} data.catatan
   * @param {string} data.foto_bukti
   */
  create: async (data) => {
    return api.post('/returns', data);
  },

  /**
   * Confirm return received (PETUGAS/ADMIN)
   * @param {string} id - Return ID
   * @param {Object} payload
   * @param {boolean} payload.confirm_payment
   */
  confirm: async (id, payload = {}) => {
    return api.patch(`/returns/${id}`, payload);
  },
};


