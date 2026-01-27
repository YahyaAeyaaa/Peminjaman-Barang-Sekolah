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

  /**
   * Verify registration code
   * @param {string} code - Registration code
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async verifyCode(code) {
    const response = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify code');
    }
    return data;
  },

  /**
   * Register new user
   * @param {Object} data - Registration data
   * @param {string} data.code - Registration code
   * @param {string} data.email - Email
   * @param {string} data.first_name - First name
   * @param {string} data.last_name - Last name
   * @param {string} data.password - Password
   * @param {string} data.kelas - Class (optional)
   * @param {string} data.no_hp - Phone number (optional)
   * @param {string} data.alamat - Address (optional)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async register(data) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: data.code.trim().toUpperCase(),
        email: data.email.trim(),
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        password: data.password,
        kelas: data.kelas?.trim() || null,
        no_hp: data.no_hp?.trim() || null,
        alamat: data.alamat?.trim() || null,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to register');
    }
    return result;
  },
};
