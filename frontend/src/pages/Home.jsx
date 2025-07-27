// frontend/src/pages/Home.jsx
import React, { useState } from 'react';
import ScrapeForm from '../components/scraping/ScrapeForm';
import ResultsTable from '../components/scraping/ResultsTable';

const Home = () => {
  const [scrapeResult, setScrapeResult] = useState(null);

  const handleScrapeComplete = (result) => {
    setScrapeResult(result);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">
          Extract Data from Any Website
        </h1>
        <p className="text-xl text-blue-100 mb-6">
          ScrapeEase uses AI to automatically detect and extract tabular data from websites. 
          No coding required - just paste a URL and download your data as CSV or JSON.
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="bg-blue-500/30 px-3 py-1 rounded-full">
            ✨ AI-Powered Detection
          </div>
          <div className="bg-blue-500/30 px-3 py-1 rounded-full">
            📊 Multiple Export Formats
          </div>
          <div className="bg-blue-500/30 px-3 py-1 rounded-full">
            ⚡ Fast & Reliable
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scraping Form */}
        <div>
          <ScrapeForm onScrapeComplete={handleScrapeComplete} />
        </div>

        {/* Results */}
        <div>
          <ResultsTable scrapeResult={scrapeResult} />
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          How ScrapeEase Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Analyze</h3>
            <p className="text-gray-600">
              Our tool analyzes the webpage structure and identifies the best data extraction strategy.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">2. Extract</h3>
            <p className="text-gray-600">
              Automatically extract structured data from tables, lists, and repeated elements.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💾</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Export</h3>
            <p className="text-gray-600">
              Download your cleaned data in CSV or JSON format for immediate use in your projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

