// frontend/src/hooks/useScraping.js
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { scrapingAPI } from '../services/scrapping';

export const useScraping = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [detectedStrategies, setDetectedStrategies] = useState(null);
  const [error, setError] = useState(null);

  const validateUrl = useCallback(async (url) => {
    if (!url) return;
    
    setIsValidating(true);
    setError(null);
    
    try {
      const result = await scrapingAPI.validateUrl(url);
      setValidationResult(result);
      
      if (result.valid) {
        // Auto-detect strategies
        const strategies = await scrapingAPI.detectStructure(url);
        setDetectedStrategies(strategies);
        toast.success('URL validated successfully!');
        return { success: true, result, strategies };
      } else {
        const errorMsg = result.error || 'URL validation failed';
        toast.error(errorMsg);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error.message || 'Validation failed';
      toast.error('Validation failed: ' + errorMsg);
      setValidationResult({ valid: false, error: errorMsg });
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const scrapeUrl = useCallback(async (scrapeRequest) => {
    if (!validationResult?.valid) {
      const errorMsg = 'Please validate the URL first';
      toast.error(errorMsg);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsScraping(true);
    setError(null);
    
    try {
      const result = await scrapingAPI.scrapeUrl(scrapeRequest);
      
      if (result.success) {
        setScrapeResult(result);
        toast.success(`Successfully scraped ${result.total_records} records!`);
        return { success: true, result };
      } else {
        const errorMsg = result.error || 'Scraping failed';
        toast.error(errorMsg);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error.message || 'Scraping failed';
      toast.error('Scraping failed: ' + errorMsg);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsScraping(false);
    }
  }, [validationResult]);

  const reset = useCallback(() => {
    setValidationResult(null);
    setScrapeResult(null);
    setDetectedStrategies(null);
    setError(null);
  }, []);

  return {
    // State
    isValidating,
    isScraping,
    validationResult,
    scrapeResult,
    detectedStrategies,
    error,
    
    // Actions
    validateUrl,
    scrapeUrl,
    reset,
    
    // Computed state
    isReady: validationResult?.valid && !isScraping,
    hasResult: !!scrapeResult,
    hasError: !!error
  };
};