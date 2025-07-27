// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { scrapingAPI } from '../services/scrapping';
import { toast } from 'react-hot-toast';
import { 
  ClockIcon, 
  DocumentIcon, 
  ArrowDownTrayIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const result = await scrapingAPI.getHistory(50);
      setHistory(result.history);
    } catch (error) {
      toast.error('Failed to load history: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (scrapeId, format) => {
    try {
      const response = await scrapingAPI.downloadFile(scrapeId, format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `scraped_data_${scrapeId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} downloaded!`);
    } catch (error) {
      toast.error('Download failed: ' + error.message);
    }
  };

  const deleteData = async (scrapeId) => {
    if (!window.confirm('Are you sure you want to delete this data?')) return;
    
    try {
      await scrapingAPI.deleteData(scrapeId);
      toast.success('Data deleted successfully');
      loadHistory(); // Refresh the list
    } catch (error) {
      toast.error('Delete failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your scraped data and download history.</p>
      </div>

      {history.length === 0 ? (
        <div className="bg-white shadow-lg rounded-lg p-12 text-center">
          <DocumentIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No scraping history</h3>
          <p className="text-gray-500 mb-4">Start scraping some websites to see your history here.</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start Scraping
          </a>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Scraping History ({history.length} items)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Columns
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item) => (
                  <tr key={item.scrape_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-sm text-gray-900" title={item.url}>
                        {item.url}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.total_records.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.columns}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadFile(item.scrape_id, 'csv')}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="Download CSV"
                        >
                          <DocumentIcon className="h-4 w-4 mr-1" />
                          CSV
                        </button>
                        <button
                          onClick={() => downloadFile(item.scrape_id, 'json')}
                          className="text-green-600 hover:text-green-900 flex items-center"
                          title="Download JSON"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                          JSON
                        </button>
                        <button
                          onClick={() => deleteData(item.scrape_id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;