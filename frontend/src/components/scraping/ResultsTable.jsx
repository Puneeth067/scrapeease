// frontend/src/components/scraping/ResultsTable.jsx
import React, { useState } from 'react';
import { 
  ArrowDownTrayIcon, 
  EyeIcon, 
  TableCellsIcon,
  DocumentTextIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { scrapingAPI } from '../../services/scrapping';

const ResultsTable = ({ scrapeResult }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewData, setPreviewData] = useState(scrapeResult?.preview || []);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  if (!scrapeResult) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8 text-center">
        <TableCellsIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Yet</h3>
        <p className="text-gray-500">Start scraping to see your extracted data here.</p>
      </div>
    );
  }

  const downloadFile = async (format) => {
    setIsDownloading(true);
    try {
      const response = await scrapingAPI.downloadFile(scrapeResult.scrape_id, format);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `scraped_data_${scrapeResult.scrape_id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${format.toUpperCase()} file downloaded successfully!`);
    } catch (error) {
      toast.error(`Download failed: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const loadFullPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const preview = await scrapingAPI.getPreview(scrapeResult.scrape_id, 50);
      setPreviewData(preview.preview);
      toast.success('Loaded more preview data');
    } catch (error) {
      toast.error(`Preview failed: ${error.message}`);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const deleteData = async () => {
    if (!window.confirm('Are you sure you want to delete this scraped data?')) {
      return;
    }

    try {
      await scrapingAPI.deleteData(scrapeResult.scrape_id);
      toast.success('Data deleted successfully');
      // You might want to trigger a parent component refresh here
    } catch (error) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-white">
            <TableCellsIcon className="h-8 w-8 mr-3" />
            <div>
              <h3 className="text-xl font-bold">Extraction Complete!</h3>
              <p className="text-green-100">
                {scrapeResult.total_records} records • {scrapeResult.columns?.length} columns
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => downloadFile('csv')}
              disabled={isDownloading}
              className="bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center disabled:opacity-50"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              CSV
            </button>
            <button
              onClick={() => downloadFile('json')}
              disabled={isDownloading}
              className="bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              JSON
            </button>
            <button
              onClick={deleteData}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Data Preview */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Data Preview</h4>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Showing {previewData.length} of {scrapeResult.total_records} records
            </span>
            {previewData.length < scrapeResult.total_records && (
              <button
                onClick={loadFullPreview}
                disabled={isLoadingPreview}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                Load More
              </button>
            )}
          </div>
        </div>

        {previewData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {scrapeResult.columns?.map((column, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {scrapeResult.columns?.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={row[column]}>
                          {row[column] || '-'}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <TableCellsIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No preview data available</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{scrapeResult.total_records}</div>
            <div className="text-sm text-gray-500">Total Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{scrapeResult.columns?.length}</div>
            <div className="text-sm text-gray-500">Columns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {scrapeResult.files ? Object.keys(scrapeResult.files).length - 1 : 0}
            </div>
            <div className="text-sm text-gray-500">Export Formats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {new Date().toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-500">Scraped Today</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;