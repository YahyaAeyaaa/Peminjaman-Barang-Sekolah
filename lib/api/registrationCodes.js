import api from './index';

/**
 * Registration Codes API
 */
export const registrationCodesAPI = {
  /**
   * Get all registration codes
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {string} params.status - Filter by status (AKTIF, NONAKTIF, EXPIRED)
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
    const url = `/registration-codes${queryString ? `?${queryString}` : ''}`;
    
    return api.get(url);
  },

  /**
   * Get registration code by ID
   * @param {string} id - Registration code ID
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  getById: async (id) => {
    return api.get(`/registration-codes/${id}`);
  },

  /**
   * Create new registration code
   * @param {Object} data - Registration code data
   * @param {string} data.code - Registration code
   * @param {string} data.keterangan - Description (optional)
   * @param {number} data.max_usage - Max usage (0 = unlimited)
   * @param {string} data.expire_date - Expire date (optional)
   * @param {string} data.status - Status (AKTIF, NONAKTIF)
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  create: async (data) => {
    return api.post('/registration-codes', data);
  },

  /**
   * Update registration code
   * @param {string} id - Registration code ID
   * @param {Object} data - Registration code data
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  update: async (id, data) => {
    return api.patch(`/registration-codes/${id}`, data);
  },

  /**
   * Delete registration code
   * @param {string} id - Registration code ID
   * @returns {Promise<{success: boolean}>}
   */
  delete: async (id) => {
    return api.delete(`/registration-codes/${id}`);
  },
};



