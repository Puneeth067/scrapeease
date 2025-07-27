// frontend/src/utils/constants.js

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Scraping Configuration
export const SCRAPING_CONFIG = {
  MAX_PAGES: 50,
  DEFAULT_PAGES: 10,
  MAX_ROWS: 10000,
  REQUEST_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  SUPPORTED_FORMATS: ['csv', 'json', 'excel'],
  DEFAULT_FORMAT: 'csv',
};

// File Configuration
export const FILE_CONFIG = {
  MAX_DOWNLOAD_SIZE: 100 * 1024 * 1024, // 100MB
  SUPPORTED_EXPORT_FORMATS: {
    csv: { extension: 'csv', mimeType: 'text/csv', name: 'CSV' },
    json: { extension: 'json', mimeType: 'application/json', name: 'JSON' },
    excel: { extension: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'Excel' },
  },
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 4000,
  LOADING_DEBOUNCE: 300,
  SEARCH_DEBOUNCE: 500,
  PAGINATION_SIZE: 20,
  PREVIEW_ROWS: 10,
  MAX_URL_DISPLAY_LENGTH: 60,
};

// Validation Rules
export const VALIDATION_RULES = {
  URL_PATTERN: /^https?:\/\/.+/,
  MIN_URL_LENGTH: 10,
  MAX_URL_LENGTH: 2000,
  MAX_PAGES_LIMIT: 50,
  MIN_PAGES_LIMIT: 1,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  VALIDATION_FAILED: 'URL validation failed. Please check the URL.',
  SCRAPING_FAILED: 'Scraping failed. Please try again.',
  DOWNLOAD_FAILED: 'Download failed. Please try again.',
  INVALID_URL: 'Please enter a valid URL starting with http:// or https://',
  URL_TOO_LONG: 'URL is too long. Please use a shorter URL.',
  MAX_PAGES_EXCEEDED: `Maximum ${SCRAPING_CONFIG.MAX_PAGES} pages allowed.`,
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  URL_VALIDATED: 'URL validated successfully!',
  SCRAPING_COMPLETE: 'Data extraction completed successfully!',
  DOWNLOAD_COMPLETE: 'File downloaded successfully!',
  DATA_DELETED: 'Data deleted successfully!',
  HISTORY_LOADED: 'History loaded successfully!',
};

// Scraping Strategies
export const SCRAPING_STRATEGIES = {
  TABLE: 'table',
  LIST_ITEMS: 'list_items',
  REPEATED_SECTIONS: 'repeated_sections',
  CUSTOM_SELECTOR: 'custom_selector',
};

// Theme Colors
export const THEME_COLORS = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  SCRAPING_HISTORY: 'scrapingHistory',
  DOWNLOAD_HISTORY: 'downloadHistory',
  BOOKMARKED_URLS: 'bookmarkedUrls',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ABOUT: '/about',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile',
};

// Feature Flags
export const FEATURES = {
  AUTHENTICATION: false,
  RATE_LIMITING: true,
  CACHING: true,
  ANALYTICS: false,
  PREMIUM_FEATURES: false,
  EXPORT_SCHEDULING: false,
};

// Analytics Events
export const ANALYTICS_EVENTS = {
  URL_VALIDATED: 'url_validated',
  SCRAPING_STARTED: 'scraping_started',
  SCRAPING_COMPLETED: 'scraping_completed',
  FILE_DOWNLOADED: 'file_downloaded',
  ERROR_OCCURRED: 'error_occurred',
};

export default {
  API_CONFIG,
  SCRAPING_CONFIG,
  FILE_CONFIG,
  UI_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SCRAPING_STRATEGIES,
  THEME_COLORS,
  STORAGE_KEYS,
  ROUTES,
  FEATURES,
  ANALYTICS_EVENTS,
};