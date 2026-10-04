import React from 'react';

export const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div
        className={`${
          sizeClasses[size] || sizeClasses.md
        } border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin`}
      />
      {message && <p className="text-xs font-medium text-slate-500 mt-3">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
