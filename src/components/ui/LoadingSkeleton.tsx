import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  lines?: number;
  type?: 'card' | 'table' | 'list' | 'form';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  lines = 1,
  type = 'card'
}) => {
  const baseClasses = `bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse rounded-lg`;

  if (type === 'card') {
    return (
      <div className={`bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 ${className}`}>
        <div className="space-y-4">
          <div className={`${baseClasses} h-6 w-3/4`}></div>
          <div className={`${baseClasses} h-4 w-1/2`}></div>
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className={`${baseClasses} ${height} ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <div className={`${baseClasses} h-6 w-1/4`}></div>
        </div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: lines || 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center space-x-4">
              <div className={`${baseClasses} h-10 w-10 rounded-full`}></div>
              <div className="flex-1 space-y-2">
                <div className={`${baseClasses} h-4 w-3/4`}></div>
                <div className={`${baseClasses} h-3 w-1/2`}></div>
              </div>
              <div className={`${baseClasses} h-8 w-20 rounded-lg`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines || 3 }).map((_, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center space-x-4">
            <div className={`${baseClasses} h-8 w-8 rounded-full`}></div>
            <div className="flex-1 space-y-2">
              <div className={`${baseClasses} h-4 w-2/3`}></div>
              <div className={`${baseClasses} h-3 w-1/3`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className={`bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-6 ${className}`}>
        {Array.from({ length: lines || 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className={`${baseClasses} h-4 w-1/4`}></div>
            <div className={`${baseClasses} h-10 w-full rounded-xl`}></div>
          </div>
        ))}
        <div className="flex justify-end space-x-3 pt-4">
          <div className={`${baseClasses} h-10 w-24 rounded-xl`}></div>
          <div className={`${baseClasses} h-10 w-20 rounded-xl`}></div>
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`${baseClasses} ${height} ${width}`}></div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;