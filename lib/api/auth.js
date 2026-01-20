/**
 * Auth API Client
 * Handles authentication-related API calls
 */

export const authAPI = {
  /**
   * Get current user session
   * @returns {Promise<Object>} Session data with user info
   */
  async getSession() {
    const response = await fetch('/api/auth/session');
    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }
    return response.json();
  },
};

