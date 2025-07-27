// frontend/src/utils/helpers.js
import { UI_CONFIG, FILE_CONFIG } from './constants';

/**
 * Format a number with thousand separators
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString();
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date in a user-friendly way
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInHours / 24;

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Format date for display
 */
export const formatDisplayDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = UI_CONFIG.MAX_URL_DISPLAY_LENGTH) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Truncate URL for display while keeping important parts
 */
export const truncateUrl = (url, maxLength = 50) => {
  if (!url) return '';
  if (url.length <= maxLength) return url;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname + urlObj.search;
    
    if (domain.length + 10 >= maxLength) {
      return domain.substring(0, maxLength - 3) + '...';
    }
    
    const availablePathLength = maxLength - domain.length - 10; // Account for protocol and ...
    if (path.length > availablePathLength) {
      return `${domain}...${path.substring(path.length - availablePathLength + 7)}`;
    }
    
    return `${domain}${path}`;
  } catch {
    return truncateText(url, maxLength);
  }
};

/**
 * Debounce function to limit API calls
 */
export const debounce = (func, delay = UI_CONFIG.SEARCH_DEBOUNCE) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function to limit function calls
 */
export const throttle = (func, limit = 1000) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Generate a unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy text: ', error);
    return false;
  }
};

/**
 * Download data as file
 */
export const downloadAsFile = (data, filename, type = 'text/plain') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Check if URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extract domain from URL
 */
export const extractDomain = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
};

/**
 * Get file extension from format
 */
export const getFileExtension = (format) => {
  return FILE_CONFIG.SUPPORTED_EXPORT_FORMATS[format]?.extension || format;
};

/**
 * Get MIME type from format
 */
export const getMimeType = (format) => {
  return FILE_CONFIG.SUPPORTED_EXPORT_FORMATS[format]?.mimeType || 'application/octet-stream';
};

/**
 * Format scraped data statistics
 */
export const formatScrapingStats = (result) => {
  if (!result) return {};
  
  return {
    records: formatNumber(result.total_records || 0),
    columns: result.columns?.length || 0,
    size: result.file_size ? formatFileSize(result.file_size) : 'Unknown',
    duration: result.duration ? `${result.duration}s` : 'Unknown',
    url: truncateUrl(result.url || '', 40),
    timestamp: formatDate(result.timestamp || new Date().toISOString())
  };
};

/**
 * Clean and normalize text
 */
export const cleanText = (text) => {
  if (!text) return '';
  return text.toString().trim().replace(/\s+/g, ' ');
};

/**
 * Convert data to CSV format
 */
export const convertToCSV = (data, headers = null) => {
  if (!data || !data.length) return '';
  
  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows = data.map(row => 
    csvHeaders.map(header => {
      const value = row[header] || '';
      const stringValue = value.toString();
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  
  return [csvHeaders.join(','), ...csvRows].join('\n');
};

/**
 * Parse CSV text to array of objects
 */
export const parseCSV = (csvText) => {
  if (!csvText) return [];
  
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
};

/**
 * Get color class for status
 */
export const getStatusColor = (status) => {
  const statusColors = {
    'success': 'text-green-600 bg-green-50',
    'error': 'text-red-600 bg-red-50',
    'warning': 'text-yellow-600 bg-yellow-50',
    'info': 'text-blue-600 bg-blue-50',
    'processing': 'text-purple-600 bg-purple-50',
    'pending': 'text-gray-600 bg-gray-50'
  };
  
  return statusColors[status] || statusColors['info'];
};

/**
 * Sleep function for delays
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry function with exponential backoff
 */
export const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await sleep(waitTime);
    }
  }
  
  throw lastError;
};

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

export default {
  formatNumber,
  formatFileSize,
  formatDate,
  formatDisplayDate,
  truncateText,
  truncateUrl,
  debounce,
  throttle,
  generateId,
  copyToClipboard,
  downloadAsFile,
  isValidUrl,
  extractDomain,
  getFileExtension,
  getMimeType,
  formatScrapingStats,
  cleanText,
  convertToCSV,
  parseCSV,
  getStatusColor,
  sleep,
  retry,
  storage
};