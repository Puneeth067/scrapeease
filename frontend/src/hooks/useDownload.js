// frontend/src/hooks/useDownload.js
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { scrapingAPI } from '../services/scrapping';

export const useDownload = () => {
  const [downloading, setDownloading] = useState({});
  const [downloadHistory, setDownloadHistory] = useState([]);

  const downloadFile = useCallback(async (scrapeId, format, filename) => {
    const downloadKey = `${scrapeId}-${format}`;
    
    if (downloading[downloadKey]) {
      toast.error('Download already in progress');
      return { success: false, error: 'Download already in progress' };
    }

    setDownloading(prev => ({ ...prev, [downloadKey]: true }));
    
    try {
      const response = await scrapingAPI.downloadFile(scrapeId, format);
      
      // Determine file extension
      const extensions = { csv: 'csv', json: 'json', excel: 'xlsx' };
      const extension = extensions[format] || format;
      const finalFilename = filename || `scraped_data_${scrapeId}.${extension}`;
      
      // Create and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', finalFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Add to download history
      const downloadRecord = {
        scrapeId,
        format,
        filename: finalFilename,
        timestamp: new Date().toISOString(),
        size: response.data.size || 0
      };
      
      setDownloadHistory(prev => [downloadRecord, ...prev.slice(0, 19)]); // Keep last 20
      
      toast.success(`${format.toUpperCase()} file downloaded successfully!`);
      return { success: true, filename: finalFilename };
      
    } catch (error) {
      const errorMsg = error.message || 'Download failed';
      toast.error(`Download failed: ${errorMsg}`);
      return { success: false, error: errorMsg };
    } finally {
      setDownloading(prev => {
        const newState = { ...prev };
        delete newState[downloadKey];
        return newState;
      });
    }
  }, [downloading]);

  const downloadMultiple = useCallback(async (scrapeId, formats, baseFilename) => {
    const results = [];
    
    for (const format of formats) {
      const filename = baseFilename ? 
        `${baseFilename}.${format === 'excel' ? 'xlsx' : format}` : 
        undefined;
        
      const result = await downloadFile(scrapeId, format, filename);
      results.push({ format, ...result });
      
      // Small delay between downloads
      if (formats.indexOf(format) < formats.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    if (successful === total) {
      toast.success(`All ${total} files downloaded successfully!`);
    } else if (successful > 0) {
      toast.success(`${successful} of ${total} files downloaded successfully`);
    } else {
      toast.error('All downloads failed');
    }
    
    return results;
  }, [downloadFile]);

  const isDownloading = useCallback((scrapeId, format) => {
    const downloadKey = format ? `${scrapeId}-${format}` : scrapeId;
    return format ? 
      !!downloading[downloadKey] : 
      Object.keys(downloading).some(key => key.startsWith(scrapeId));
  }, [downloading]);

  const getDownloadHistory = useCallback((scrapeId) => {
    return scrapeId ? 
      downloadHistory.filter(item => item.scrapeId === scrapeId) :
      downloadHistory;
  }, [downloadHistory]);

  const clearDownloadHistory = useCallback(() => {
    setDownloadHistory([]);
    toast.success('Download history cleared');
  }, []);

  return {
    // State
    downloading,
    downloadHistory,
    
    // Actions
    downloadFile,
    downloadMultiple,
    clearDownloadHistory,
    
    // Computed state
    isDownloading,
    getDownloadHistory,
    hasActiveDownloads: Object.keys(downloading).length > 0,
    totalDownloads: downloadHistory.length
  };
};