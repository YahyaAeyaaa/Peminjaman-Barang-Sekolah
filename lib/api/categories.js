import api from './index';

/**
 * Categories API
 */
export const categoriesAPI = {
  /**
   * Get all categories
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @returns {Promise<{success: boolean, data: Array}>}
   */
  getAll: async (params = {}) => {
    const { search, ...otherParams } = params;
    const queryParams = new URLSearchParams();
    
    if (search) queryParams.append('search', search);
    Object.keys(otherParams).forEach(key => {
      if (otherParams[key] !== undefined && otherParams[key] !== null) {
        queryParams.append(key, otherParams[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = `/categories${queryString ? `?${queryString}` : ''}`;
    
    return api.get(url);
  },

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  getById: async (id) => {
    return api.get(`/categories/${id}`);
  },

  /**
   * Create new category
   * @param {Object} data - Category data
   * @param {string} data.nama - Category name
   * @param {string} data.deskripsi - Category description
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  create: async (data) => {
    return api.post('/categories', data);
  },

  /**
   * Update category
   * @param {string} id - Category ID
   * @param {Object} data - Category data
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  update: async (id, data) => {
    return api.patch(`/categories/${id}`, data);
  },

  /**
   * Delete category
   * @param {string} id - Category ID
   * @returns {Promise<{success: boolean}>}
   */
  delete: async (id) => {
    return api.delete(`/categories/${id}`);
  },
};

