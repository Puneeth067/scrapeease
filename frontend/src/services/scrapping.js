// frontend/src/services/scraping.js
import apiClient from './api';

export const scrapingAPI = {
  // Validate URL
  async validateUrl(url) {
    try {
      const response = await apiClient.post('/validate-url', { url });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'URL validation failed');
    }
  },

  // Detect data structure
  async detectStructure(url) {
    try {
      const response = await apiClient.post('/detect-structure', { url });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Structure detection failed');
    }
  },

  // Start scraping
  async scrapeUrl(scrapeRequest) {
    try {
      const response = await apiClient.post('/scrape', scrapeRequest);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Scraping failed');
    }
  },

  // Get scrape status
  async getScrapeStatus(scrapeId) {
    try {
      const response = await apiClient.get(`/scrape/${scrapeId}/status`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Status check failed');
    }
  },

  // Get scraping history
  async getHistory(limit = 20) {
    try {
      const response = await apiClient.get(`/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'History fetch failed');
    }
  },

  // Download file
  async downloadFile(scrapeId, fileType) {
    try {
      const response = await apiClient.get(`/download/${scrapeId}/${fileType}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Download failed');
    }
  },

  // Get data preview
  async getPreview(scrapeId, limit = 10) {
    try {
      const response = await apiClient.get(`/preview/${scrapeId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Preview failed');
    }
  },

  // Delete scraped data
  async deleteData(scrapeId) {
    try {
      const response = await apiClient.delete(`/data/${scrapeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Delete failed');
    }
  }
};