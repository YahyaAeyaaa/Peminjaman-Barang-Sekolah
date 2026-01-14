import api from './index';

/**
 * Upload API
 */
export const uploadAPI = {
  /**
   * Upload image file
   * @param {File} file - Image file to upload
   * @returns {Promise<{success: boolean, data: {url: string, filename: string, size: number, type: string}}>}
   */
  uploadImage: async (file) => {
    if (!file) {
      throw new Error('File tidak boleh kosong');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Axios dengan FormData perlu config khusus
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  },
};

