// frontend/src/components/common/LoadingSpinner.jsx
import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = ({ size = 'md', message = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <ArrowPathIcon 
        className={`${sizeClasses[size]} text-blue-600 animate-spin`} 
      />
      {message && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;