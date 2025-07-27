// frontend/src/pages/About.jsx
import React from 'react';
import { 
  SparklesIcon, 
  ShieldCheckIcon, 
  BoltIcon, 
  GlobeAltIcon 
} from '@heroicons/react/24/outline';

const About = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Detection',
      description: 'Our intelligent algorithms automatically detect the best extraction strategy for any website structure.'
    },
    {
      icon: BoltIcon,
      title: 'Lightning Fast',
      description: 'Extract thousands of records in seconds with our optimized scraping engine.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Reliable & Safe',
      description: 'Respects robots.txt, handles rate limiting, and ensures safe scraping practices.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Universal Compatibility',
      description: 'Works with any website - from e-commerce sites to data portals and everything in between.'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About ScrapeEase
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're making web data extraction accessible to everyone. No coding, no complex configurations - 
          just simple, powerful scraping that works with any website.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-lg p-3 mr-4">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          );
        })}
      </div>

      {/* Technology Stack */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Built with Modern Technology
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="bg-red-100 rounded-lg p-4 mb-2">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold">FastAPI</h3>
            <p className="text-sm text-gray-600">High-performance backend</p>
          </div>
          <div>
            <div className="bg-blue-100 rounded-lg p-4 mb-2">
              <span className="text-2xl">⚛️</span>
            </div>
            <h3 className="font-semibold">React</h3>
            <p className="text-sm text-gray-600">Modern frontend</p>
          </div>
          <div>
            <div className="bg-green-100 rounded-lg p-4 mb-2">
              <span className="text-2xl">🐍</span>
            </div>
            <h3 className="font-semibold">BeautifulSoup</h3>
            <p className="text-sm text-gray-600">Smart HTML parsing</p>
          </div>
          <div>
            <div className="bg-purple-100 rounded-lg p-4 mb-2">
              <span className="text-2xl">🐼</span>
            </div>
            <h3 className="font-semibold">Pandas</h3>
            <p className="text-sm text-gray-600">Data processing</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Extract Your Data?</h2>
        <p className="text-xl text-blue-100 mb-6">
          Join thousands of users who trust ScrapeEase for their data extraction needs.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Start Scraping Now
        </a>
      </div>
    </div>
  );
};

export default About;