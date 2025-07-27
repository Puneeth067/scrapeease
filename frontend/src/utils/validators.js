// frontend/src/utils/validators.js
import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

/**
 * Validate URL format and structure
 */
export const validateUrl = (url) => {
  const errors = [];
  
  if (!url || typeof url !== 'string') {
    errors.push('URL is required');
    return { isValid: false, errors };
  }
  
  const trimmedUrl = url.trim();
  
  if (trimmedUrl.length < VALIDATION_RULES.MIN_URL_LENGTH) {
    errors.push('URL is too short');
  }
  
  if (trimmedUrl.length > VALIDATION_RULES.MAX_URL_LENGTH) {
    errors.push(ERROR_MESSAGES.URL_TOO_LONG);
  }
  
  if (!VALIDATION_RULES.URL_PATTERN.test(trimmedUrl)) {
    errors.push(ERROR_MESSAGES.INVALID_URL);
  }
  
  // Additional URL validation
  try {
    const urlObj = new URL(trimmedUrl);
    
    // Check for valid protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      errors.push('Only HTTP and HTTPS protocols are supported');
    }
    
    // Check for valid hostname
    if (!urlObj.hostname || urlObj.hostname.length < 2) {
      errors.push('Invalid hostname');
    }
    
    // Check for localhost in production (optional)
    if (import.meta.env.PROD && urlObj.hostname === 'localhost') {
      errors.push('Localhost URLs are not allowed in production');
    }
    
  } catch {
    errors.push('Invalid URL format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    cleanUrl: trimmedUrl
  };
};

/**
 * Validate scraping parameters
 */
export const validateScrapeParams = (params) => {
  const errors = [];
  
  // Validate URL
  const urlValidation = validateUrl(params.url);
  if (!urlValidation.isValid) {
    errors.push(...urlValidation.errors);
  }
  
  // Validate max pages
  if (params.maxPages !== undefined) {
    const maxPages = parseInt(params.maxPages);
    if (isNaN(maxPages)) {
      errors.push('Max pages must be a number');
    } else if (maxPages < VALIDATION_RULES.MIN_PAGES_LIMIT) {
      errors.push(`Min pages is ${VALIDATION_RULES.MIN_PAGES_LIMIT}`);
    } else if (maxPages > VALIDATION_RULES.MAX_PAGES_LIMIT) {
      errors.push(ERROR_MESSAGES.MAX_PAGES_EXCEEDED);
    }
  }
  
  // Validate strategy
  if (params.strategy && typeof params.strategy !== 'object') {
    errors.push('Invalid strategy format');
  }
  
  // Validate format
  if (params.format && !['csv', 'json', 'excel', 'both'].includes(params.format)) {
    errors.push('Invalid export format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    cleanParams: {
      url: urlValidation.cleanUrl,
      maxPages: params.maxPages ? parseInt(params.maxPages) : 10,
      strategy: params.strategy,
      format: params.format || 'csv'
    }
  };
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const errors = [];
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    cleanEmail: email.trim().toLowerCase()
  };
};

/**
 * Validate form data
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = data[field];
    const fieldErrors = [];
    
    // Required validation
    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(`${fieldRules.label || field} is required`);
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !fieldRules.required) return;
    
    // Min length validation
    if (fieldRules.minLength && value.toString().length < fieldRules.minLength) {
      fieldErrors.push(`${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`);
    }
    
    // Max length validation
    if (fieldRules.maxLength && value.toString().length > fieldRules.maxLength) {
      fieldErrors.push(`${fieldRules.label || field} must be less than ${fieldRules.maxLength} characters`);
    }
    
    // Pattern validation
    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      fieldErrors.push(fieldRules.patternMessage || `${fieldRules.label || field} format is invalid`);
    }
    
    // Custom validation
    if (fieldRules.validate && typeof fieldRules.validate === 'function') {
      const customResult = fieldRules.validate(value, data);
      if (customResult !== true) {
        fieldErrors.push(customResult);
      }
    }
    
    // Min/Max value validation
    if (fieldRules.min !== undefined) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue < fieldRules.min) {
        fieldErrors.push(`${fieldRules.label || field} must be at least ${fieldRules.min}`);
      }
    }
    
    if (fieldRules.max !== undefined) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > fieldRules.max) {
        fieldErrors.push(`${fieldRules.label || field} must be less than ${fieldRules.max}`);
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

/**
 * Validate file upload
 */
export const validateFile = (file, options = {}) => {
  const errors = [];
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['text/csv', 'application/json'],
    allowedExtensions = ['.csv', '.json']
  } = options;
  
  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExtension)) {
    errors.push(`File extension must be one of: ${allowedExtensions.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: fileExtension
    }
  };
};

/**
 * Validate scraping strategy
 */
export const validateStrategy = (strategy) => {
  const errors = [];
  
  if (!strategy || typeof strategy !== 'object') {
    errors.push('Strategy is required and must be an object');
    return { isValid: false, errors };
  }
  
  // Validate strategy type
  const validTypes = ['table', 'list_items', 'repeated_sections', 'custom_selector'];
  if (!strategy.type || !validTypes.includes(strategy.type)) {
    errors.push(`Strategy type must be one of: ${validTypes.join(', ')}`);
  }
  
  // Validate selector
  if (!strategy.selector || typeof strategy.selector !== 'string') {
    errors.push('Strategy selector is required and must be a string');
  }
  
  // Validate estimated counts
  if (strategy.estimated_rows !== undefined && (!Number.isInteger(strategy.estimated_rows) || strategy.estimated_rows < 0)) {
    errors.push('Estimated rows must be a non-negative integer');
  }
  
  if (strategy.estimated_columns !== undefined && (!Number.isInteger(strategy.estimated_columns) || strategy.estimated_columns < 0)) {
    errors.push('Estimated columns must be a non-negative integer');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    cleanStrategy: {
      type: strategy.type,
      selector: strategy.selector.trim(),
      estimated_rows: strategy.estimated_rows || 0,
      estimated_columns: strategy.estimated_columns || 0,
      estimated_items: strategy.estimated_items || 0
    }
  };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (page, limit) => {
  const errors = [];
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    errors.push('Page must be a positive integer');
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    errors.push('Limit must be between 1 and 100');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    cleanParams: {
      page: Math.max(1, pageNum || 1),
      limit: Math.min(100, Math.max(1, limitNum || 20))
    }
  };
};

/**
 * Sanitize string input
 */
export const sanitizeString = (str, options = {}) => {
  if (!str || typeof str !== 'string') return '';
  
  const {
    trim = true,
    toLowerCase = false,
    removeHtml = true,
    maxLength = 1000
  } = options;
  
  let cleaned = str;
  
  if (trim) {
    cleaned = cleaned.trim();
  }
  
  if (toLowerCase) {
    cleaned = cleaned.toLowerCase();
  }
  
  if (removeHtml) {
    cleaned = cleaned.replace(/<[^>]*>/g, '');
  }
  
  // Remove dangerous characters
  cleaned = cleaned.replace(/[<>'"&]/g, '');
  
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  
  return cleaned;
};

export default {
  validateUrl,
  validateScrapeParams,
  validateEmail,
  validateForm,
  validateFile,
  validateStrategy,
  validatePagination,
  sanitizeString
};