import { usersAPI } from './users';

/**
 * Profile API
 */
export const profileAPI = {
  /**
   * Get current user session
   * @returns {Promise<{user: Object}>}
   */
  getSession: async () => {
    // NextAuth session endpoint
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
    });
    const data = await response.json();
    return data;
  },

  /**
   * Update profile
   * @param {string} userId - User ID
   * @param {Object} data - Profile data
   * @param {string} data.first_name - First name
   * @param {string} data.last_name - Last name
   * @param {string} data.no_hp - Phone number (optional)
   * @param {string} data.alamat - Address (optional)
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  update: async (userId, data) => {
    return usersAPI.update(userId, data);
  },

  /**
   * Change password
   * @param {string} userId - User ID
   * @param {string} password - New password
   * @returns {Promise<{success: boolean}>}
   */
  changePassword: async (userId, password) => {
    return usersAPI.update(userId, { password });
  },
};

