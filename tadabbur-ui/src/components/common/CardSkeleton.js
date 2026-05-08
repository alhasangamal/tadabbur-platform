import React from 'react';

const CardSkeleton = () => {
  return (
    <div className="glass-card flex flex-col h-full overflow-hidden animate-pulse">
      <div className="p-6 flex flex-col h-full space-y-4">
        <div className="flex justify-between items-start">
          <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        
        <div className="w-3/4 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-sand-200 dark:border-ink-light/20 flex justify-between">
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
