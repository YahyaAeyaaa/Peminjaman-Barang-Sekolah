import api from './index';

/**
 * Equipment API
 */
export const equipmentAPI = {
  /**
   * Get all equipment
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {string} params.kategori_id - Filter by category ID
   * @param {string} params.status - Filter by status (AVAILABLE, UNAVAILABLE, MAINTENANCE)
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
    const url = `/equipment${queryString ? `?${queryString}` : ''}`;
    
    return api.get(url);
  },

  /**
   * Get equipment by ID
   * @param {string} id - Equipment ID
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  getById: async (id) => {
    return api.get(`/equipment/${id}`);
  },

  /**
   * Create new equipment
   * @param {Object} data - Equipment data
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  create: async (data) => {
    return api.post('/equipment', data);
  },

  /**
   * Update equipment
   * @param {string} id - Equipment ID
   * @param {Object} data - Equipment data
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  update: async (id, data) => {
    return api.patch(`/equipment/${id}`, data);
  },

  /**
   * Delete equipment
   * @param {string} id - Equipment ID
   * @returns {Promise<{success: boolean}>}
   */
  delete: async (id) => {
    return api.delete(`/equipment/${id}`);
  },
};

