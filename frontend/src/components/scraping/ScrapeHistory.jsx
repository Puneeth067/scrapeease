// frontend/src/components/scraping/ScrapeHistory.jsx
import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { scrapingAPI } from '../../services/scrapping';
import LoadingSpinner from '../common/LoadingSpinner';

const ScrapeHistory = ({ limit = 10, showActions = true }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    loadHistory();
  }, [limit]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await scrapingAPI.getHistory(limit);
      setHistory(result.history || []);
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
      setHistory(prev => prev.filter(item => item.scrape_id !== scrapeId));
    } catch (error) {
      toast.error('Delete failed: ' + error.message);
    }
  };

  const viewPreview = async (scrapeId) => {
    try {
      const preview = await scrapingAPI.getPreview(scrapeId, 5);
      // You could show this in a modal or navigate to a preview page
      console.log('Preview data:', preview);
      toast.success('Preview loaded - check console for now');
    } catch (error) {
      toast.error('Preview failed: ' + error.message);
    }
  };

  // Filter and sort history
  const filteredHistory = history
    .filter(item => {
      const matchesSearch = item.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'recent' && new Date(item.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)) ||
        (filterBy === 'large' && item.total_records > 100);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'records':
          return b.total_records - a.total_records;
        case 'url':
          return a.url.localeCompare(b.url);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <LoadingSpinner message="Loading scraping history..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-6 w-6 text-blue-600 mr-2" />
              Scraping History
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredHistory.length} of {history.length} items
            </p>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search URLs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Items</option>
              <option value="recent">Last 24h</option>
              <option value="large">100+ Records</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="records">Sort by Records</option>
              <option value="url">Sort by URL</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="p-8 text-center">
          <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching history' : 'No scraping history'}
          </h4>
          <p className="text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Start scraping to see your history here'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredHistory.map((item, index) => (
            <div key={item.scrape_id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      #{index + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 truncate mb-1" title={item.url}>
                    {item.url}
                  </h4>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{item.total_records.toLocaleString()} records</span>
                    <span>{item.columns} columns</span>
                    <span className="text-green-600 font-medium">Success</span>
                  </div>
                </div>

                {showActions && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => viewPreview(item.scrape_id)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Preview data"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => downloadFile(item.scrape_id, 'csv')}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Download CSV"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteData(item.scrape_id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete data"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {history.length >= limit && (
        <div className="bg-gray-50 px-6 py-4 border-t text-center">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View All History →
          </button>
        </div>
      )}
    </div>
  );
};

export default ScrapeHistory;