// frontend/src/components/scraping/DownloadOptions.jsx
import React, { useState } from 'react';
import { 
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  TableCellsIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { scrapingAPI } from '../../services/scrapping';

const DownloadOptions = ({ scrapeResult }) => {
  const [downloading, setDownloading] = useState({});

  if (!scrapeResult) return null;

  const downloadFormats = [
    {
      key: 'csv',
      name: 'CSV',
      description: 'Comma-separated values for Excel and data analysis',
      icon: TableCellsIcon,
      color: 'green',
      extension: 'csv'
    },
    {
      key: 'json',
      name: 'JSON', 
      description: 'JavaScript Object Notation for APIs and web apps',
      icon: CodeBracketIcon,
      color: 'blue',
      extension: 'json'
    },
    {
      key: 'excel',
      name: 'Excel',
      description: 'Microsoft Excel format with formatting',
      icon: DocumentTextIcon,
      color: 'purple',
      extension: 'xlsx'
    }
  ];

  const downloadFile = async (format) => {
    setDownloading(prev => ({ ...prev, [format.key]: true }));
    
    try {
      const response = await scrapingAPI.downloadFile(scrapeResult.scrape_id, format.key);
      
      // Create and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `scraped_data_${scrapeResult.scrape_id}.${format.extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${format.name} file downloaded successfully!`);
    } catch (error) {
      toast.error(`Download failed: ${error.message}`);
    } finally {
      setDownloading(prev => ({ ...prev, [format.key]: false }));
    }
  };

  const downloadAll = async () => {
    for (const format of downloadFormats) {
      await downloadFile(format);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ArrowDownTrayIcon className="h-6 w-6 text-blue-600 mr-2" />
            Download Options
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose your preferred format to export the scraped data
          </p>
        </div>
        
        <button
          onClick={downloadAll}
          disabled={Object.values(downloading).some(d => d)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-sm font-medium"
        >
          Download All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {downloadFormats.map((format) => {
          const Icon = format.icon;
          const isDownloading = downloading[format.key];
          
          return (
            <div
              key={format.key}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-${format.color}-100`}>
                  <Icon className={`h-6 w-6 text-${format.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900">{format.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {format.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  .{format.extension}
                </div>
                <button
                  onClick={() => downloadFile(format)}
                  disabled={isDownloading}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDownloading
                      ? 'bg-gray-100 text-gray-400'
                      : `text-${format.color}-700 bg-${format.color}-50 hover:bg-${format.color}-100 focus:ring-${format.color}-500`
                  }`}
                >
                  {isDownloading ? (
                    <div className="flex items-center">
                      <ArrowDownTrayIcon className="h-3 w-3 mr-1 animate-pulse" />
                      Downloading...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                      Download
                    </div>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* File Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center text-sm text-gray-600">
          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
          <span>
            Ready to download: {scrapeResult.total_records} records × {scrapeResult.columns?.length} columns
          </span>
        </div>
      </div>
    </div>
  );
};

export default DownloadOptions;