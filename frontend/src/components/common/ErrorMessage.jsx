// frontend/src/components/common/ErrorMessage.jsx
import React from 'react';
import { 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const ErrorMessage = ({ 
  title = 'Something went wrong',
  message,
  type = 'error', // 'error', 'warning', 'info'
  onRetry,
  className = ''
}) => {
  const typeStyles = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: XCircleIcon,
      iconColor: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const style = typeStyles[type];
  const Icon = style.icon;

  return (
    <div className={`border rounded-lg p-4 ${style.container} ${className}`}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${style.iconColor} mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <h3 className="font-medium text-sm mb-1">{title}</h3>
          {message && (
            <p className="text-sm opacity-90">{message}</p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className={`mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-md ${style.button} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-red-500`}
            >
              <ArrowPathIcon className="h-3 w-3 mr-1" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;