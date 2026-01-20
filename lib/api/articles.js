import api from './index';

/**
 * Articles API
 */
export const articlesAPI = {
  /**
   * Get all articles
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {string} params.status - Filter by status (DRAFT, PUBLISHED, ARCHIVED)
   * @param {boolean} params.published - Only get published articles (for public)
   * @param {number} params.limit - Limit results
   * @param {number} params.offset - Offset for pagination
   * @returns {Promise<{success: boolean, data: Array, total: number}>}
   */
  getAll: async (params = {}) => {
    const { search, status, published, limit, offset, ...otherParams } = params;
    const queryParams = new URLSearchParams();
    
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (published !== undefined) queryParams.append('published', published.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());
    
    Object.keys(otherParams).forEach(key => {
      if (otherParams[key] !== undefined && otherParams[key] !== null) {
        queryParams.append(key, otherParams[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = `/articles${queryString ? `?${queryString}` : ''}`;
    
    return api.get(url);
  },

  /**
   * Get article by ID or slug
   * @param {string} id - Article ID or slug
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  getById: async (id) => {
    return api.get(`/articles/${id}`);
  },

  /**
   * Create new article
   * @param {Object} data - Article data
   * @param {string} data.judul - Article title
   * @param {string} data.konten - Article content
   * @param {string} data.excerpt - Article excerpt (optional)
   * @param {string} data.thumbnail - Thumbnail URL (optional)
   * @param {Array<string>} data.tags - Article tags (optional)
   * @param {string} data.status - Article status (DRAFT, PUBLISHED, ARCHIVED)
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  create: async (data) => {
    return api.post('/articles', data);
  },

  /**
   * Update article
   * @param {string} id - Article ID
   * @param {Object} data - Article data
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  update: async (id, data) => {
    return api.patch(`/articles/${id}`, data);
  },

  /**
   * Delete article
   * @param {string} id - Article ID
   * @returns {Promise<{success: boolean}>}
   */
  delete: async (id) => {
    return api.delete(`/articles/${id}`);
  },
};

