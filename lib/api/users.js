import api from './index';

/**
 * Users API
 */
export const usersAPI = {
  /**
   * Get all users
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {string} params.role - Filter by role (ADMIN, PETUGAS, PEMINJAM)
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
    const url = `/users${queryString ? `?${queryString}` : ''}`;
    
    return api.get(url);
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  getById: async (id) => {
    return api.get(`/users/${id}`);
  },

  /**
   * Create new user (khusus untuk petugas/admin)
   * @param {Object} data - User data
   * @param {string} data.email - User email
   * @param {string} data.password - User password
   * @param {string} data.first_name - First name
   * @param {string} data.last_name - Last name
   * @param {string} data.role - Role (PETUGAS or ADMIN)
   * @param {string} data.no_hp - Phone number (optional)
   * @param {string} data.alamat - Address (optional)
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  create: async (data) => {
    return api.post('/users', data);
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} data - User data
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  update: async (id, data) => {
    return api.patch(`/users/${id}`, data);
  },

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<{success: boolean}>}
   */
  delete: async (id) => {
    return api.delete(`/users/${id}`);
  },
};



