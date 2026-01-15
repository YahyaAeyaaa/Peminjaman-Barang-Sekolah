import api from './index';

/**
 * Activity Logs API
 */
export const activityLogsAPI = {
  /**
   * Get all activity logs (ADMIN only)
   * @param {Object} params
   * @param {string} params.action - Filter by action (CREATE, UPDATE, DELETE, LOGIN, etc)
   * @param {string} params.table_name - Filter by table name (users, equipment, loans, etc)
   * @param {string} params.user_id - Filter by user ID
   * @param {string} params.date_from - Filter from date (YYYY-MM-DD)
   * @param {string} params.date_to - Filter to date (YYYY-MM-DD)
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 50)
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const qs = queryParams.toString();
    return api.get(`/activity-logs${qs ? `?${qs}` : ''}`);
  },
};


