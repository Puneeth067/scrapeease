// frontend/src/components/scraping/ScrapeForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  GlobeAltIcon, 
  PlayIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { scrapingAPI } from '../../services/scrapping';

const ScrapeForm = ({ onScrapeComplete }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [detectedStrategies, setDetectedStrategies] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const watchedUrl = watch('url');

  const validateUrl = async (url) => {
    if (!url) return;
    
    setIsValidating(true);
    try {
      const result = await scrapingAPI.validateUrl(url);
      setValidationResult(result);
      
      if (result.valid) {
        // Auto-detect strategies
        const strategies = await scrapingAPI.detectStructure(url);
        setDetectedStrategies(strategies);
        if (strategies.recommended_strategy) {
          setSelectedStrategy(strategies.recommended_strategy);
        }
        toast.success('URL validated successfully!');
      } else {
        toast.error(result.error || 'URL validation failed');
      }
    } catch (error) {
      toast.error('Validation failed: ' + error.message);
      setValidationResult({ valid: false, error: error.message });
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data) => {
    if (!validationResult?.valid) {
      toast.error('Please validate the URL first');
      return;
    }

    setIsScraping(true);
    try {
      const scrapeRequest = {
        url: data.url,
        max_pages: parseInt(data.maxPages) || 10,
        strategy: selectedStrategy
      };

      const result = await scrapingAPI.scrapeUrl(scrapeRequest);
      
      if (result.success) {
        toast.success(`Successfully scraped ${result.total_records} records!`);
        onScrapeComplete(result);
      } else {
        toast.error(result.error || 'Scraping failed');
      }
    } catch (error) {
      toast.error('Scraping failed: ' + error.message);
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <GlobeAltIcon className="h-8 w-8 text-blue-600 mr-3" />
          ScrapeEase - Web Data Extractor
        </h2>
        <p className="text-gray-600 mt-2">
          Extract tabular data from any website. Just enter a URL and let our AI detect the best extraction strategy.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <div className="flex">
            <div className="flex-1">
              <input
                {...register('url', { 
                  required: 'URL is required',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL (starting with http:// or https://)'
                  }
                })}
                type="url"
                placeholder="https://example.com/data-page"
                className="w-full px-4 py-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => validateUrl(watchedUrl)}
              disabled={!watchedUrl || isValidating}
              className="px-4 py-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isValidating ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
              <span className="ml-2">Validate</span>
            </button>
          </div>
        </div>

        {/* Validation Result */}
        {validationResult && (
          <div className={`p-4 rounded-md ${
            validationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {validationResult.valid ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className={`font-medium ${
                validationResult.valid ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.valid ? 'URL is valid!' : 'Validation failed'}
              </span>
            </div>
            
            {validationResult.valid && (
              <div className="mt-2 text-sm text-green-700">
                <p>Found: {validationResult.tables_found} tables, {validationResult.lists_found} lists</p>
                {validationResult.title && <p>Page title: {validationResult.title}</p>}
              </div>
            )}
            
            {!validationResult.valid && validationResult.error && (
              <p className="mt-1 text-sm text-red-600">{validationResult.error}</p>
            )}
          </div>
        )}

        {/* Strategy Selection */}
        {detectedStrategies && detectedStrategies.strategies.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extraction Strategy
            </label>
            <div className="space-y-2">
              {detectedStrategies.strategies.map((strategy, index) => (
                <div key={index} className="flex items-center p-3 border rounded-md hover:bg-gray-50">
                  <input
                    type="radio"
                    id={`strategy-${index}`}
                    name="strategy"
                    checked={selectedStrategy === strategy}
                    onChange={() => setSelectedStrategy(strategy)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={`strategy-${index}`} className="ml-3 flex-1 cursor-pointer">
                    <div className="font-medium text-gray-900 capitalize">
                      {strategy.type.replace('_', ' ')} Strategy
                    </div>
                    <div className="text-sm text-gray-500">
                      {strategy.type === 'table' && `${strategy.estimated_rows} rows × ${strategy.estimated_columns} columns`}
                      {strategy.type === 'list_items' && `${strategy.estimated_items} items detected`}
                      {strategy.type === 'repeated_sections' && `${strategy.estimated_items} repeated sections`}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Selector: {strategy.selector}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Pages
            </label>
            <input
              {...register('maxPages')}
              type="number"
              min="1"
              max="50"
              defaultValue="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              {...register('format')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="both">CSV + JSON</option>
              <option value="csv">CSV only</option>
              <option value="json">JSON only</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!validationResult?.valid || isScraping}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isScraping ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <PlayIcon className="h-5 w-5 mr-2" />
            )}
            {isScraping ? 'Scraping...' : 'Start Scraping'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScrapeForm;