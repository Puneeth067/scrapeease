// frontend/src/pages/About.jsx
import React from 'react';
import { 
  GlobeAltIcon,
  LightBulbIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const features = [
    {
      icon: LightBulbIcon, 
      title: 'AI-Powered Detection',
      description: 'Our smart algorithms automatically detect the best strategy to extract data from any website structure.'
    },
    {
      icon: CogIcon,
      title: 'No Code Required', 
      description: 'Simply paste a URL and let ScrapeEase handle the complex scraping logic for you.'
    },
    {
      icon: ChartBarIcon,
      title: 'Multiple Formats',
      description: 'Export your data in CSV, JSON, or Excel formats for immediate use in your projects.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Reliable & Fast',
      description: 'Built with modern technologies to ensure fast processing and reliable data extraction.'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Scalable',
      description: 'Handle everything from small tables to large datasets with thousands of records.'
    },
    {
      icon: UserGroupIcon,
      title: 'User Friendly',
      description: 'Designed for both technical and non-technical users with an intuitive interface.'
    }
  ];

  const techStack = [
    { name: 'React', description: 'Modern frontend framework', color: 'blue' },
    { name: 'FastAPI', description: 'High-performance Python backend', color: 'green' },
    { name: 'Beautiful Soup', description: 'Python web scraping library', color: 'purple' },
    { name: 'Pandas', description: 'Data processing and analysis', color: 'orange' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS framework', color: 'cyan' },
    { name: 'Docker', description: 'Containerization platform', color: 'blue' }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4 flex items-center">
            <GlobeAltIcon className="h-10 w-10 mr-4" />
            About ScrapeEase
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            ScrapeEase is the ultimate web scraping platform that transforms any website's tabular data 
            into structured, downloadable formats. Built for data enthusiasts, researchers, and businesses 
            who need reliable data extraction without the complexity of coding.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            To democratize data extraction by making web scraping accessible to everyone, 
            regardless of their technical background. We believe that valuable data shouldn't 
            be locked away behind complex HTML structures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">1</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Paste URL</h3>
            <p className="text-gray-600">
              Simply paste the URL of the webpage containing the data you want to extract.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-600">
              Our AI analyzes the page structure and automatically detects the best extraction strategy.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Download Data</h3>
            <p className="text-gray-600">
              Get your structured data in CSV, JSON, or Excel format ready for analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Built With Modern Technology</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((tech, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full bg-${tech.color}-500`}></div>
                <div>
                  <h4 className="font-medium text-gray-900">{tech.name}</h4>
                  <p className="text-sm text-gray-600">{tech.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Perfect For</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Researchers & Analysts</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Market research and competitor analysis</li>
              <li>• Academic research data collection</li>
              <li>• Price monitoring and comparison</li>
              <li>• Social media metrics tracking</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Businesses & Entrepreneurs</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Lead generation and contact lists</li>
              <li>• Product catalog extraction</li>
              <li>• Directory and listing scraping</li>
              <li>• Data migration and backup</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold mb-2">10K+</div>
            <div className="text-green-100">URLs Scraped</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">1M+</div>
            <div className="text-green-100">Records Extracted</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">500+</div>
            <div className="text-green-100">Happy Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">99.9%</div>
            <div className="text-green-100">Uptime</div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <HeartIcon className="h-6 w-6 text-red-500 mr-2" />
          <span className="text-lg font-medium text-gray-900">Ready to extract some data?</span>
        </div>
        <p className="text-gray-600 mb-6">
          Join thousands of users who trust ScrapeEase for their data extraction needs.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Scraping Now
          <RocketLaunchIcon className="h-5 w-5 ml-2" />
        </a>
      </div>
    </div>
  );
};

export default About;