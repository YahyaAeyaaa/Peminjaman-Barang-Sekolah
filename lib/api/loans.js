import api from './index';

/**
 * Loans API
 */
export const loansAPI = {
  /**
   * Get all loans
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status (PENDING, APPROVED, REJECTED, BORROWED, RETURNED, OVERDUE)
   * @returns {Promise<{success: boolean, data: Array}>}
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = `/loans${queryString ? `?${queryString}` : ''}`;
    
    return api.get(url);
  },

  /**
   * Get loan by ID
   * @param {string} id - Loan ID
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  getById: async (id) => {
    return api.get(`/loans/${id}`);
  },

  /**
   * Create new loan
   * @param {Object} data - Loan data
   * @param {string} data.equipment_id - Equipment ID
   * @param {number} data.jumlah - Jumlah barang
   * @param {string} data.tanggal_deadline - Tanggal deadline (ISO string)
   * @param {string} data.keterangan - Keterangan (optional)
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  create: async (data) => {
    return api.post('/loans', data);
  },

  /**
   * Update loan
   * @param {string} id - Loan ID
   * @param {Object} data - Loan data
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  update: async (id, data) => {
    return api.patch(`/loans/${id}`, data);
  },

  /**
   * Approve loan (PETUGAS/ADMIN)
   * @param {string} id - Loan ID
   */
  approve: async (id) => {
    return api.patch(`/loans/${id}`, { action: 'APPROVE' });
  },

  /**
   * Reject loan (PETUGAS/ADMIN)
   * @param {string} id - Loan ID
   * @param {string} rejection_reason - Reason
   */
  reject: async (id, rejection_reason) => {
    return api.patch(`/loans/${id}`, { action: 'REJECT', rejection_reason });
  },

  /**
   * Confirm equipment taken (APPROVED -> BORROWED) (PETUGAS/ADMIN)
   * @param {string} id - Loan ID
   */
  confirmTake: async (id) => {
    return api.patch(`/loans/${id}`, { action: 'CONFIRM_TAKE' });
  },

  /**
   * Delete loan
   * @param {string} id - Loan ID
   * @returns {Promise<{success: boolean}>}
   */
  delete: async (id) => {
    return api.delete(`/loans/${id}`);
  },
};

