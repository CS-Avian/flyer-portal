import React from 'react';
import { SearchX, UserPlus, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionType?: 'reset-filter' | 'create-member';
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data found',
  message = 'No frequent flyer members matched your current filter criteria.',
  actionType = 'reset-filter',
  onAction,
}) => {
  return (
    <div
      role="region"
      aria-label="Empty search results"
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-mono-50 border border-dashed border-mono-300 rounded-lg my-4"
    >
      <div className="w-12 h-12 rounded-full bg-mono-100 flex items-center justify-center mb-4 text-mono-700">
        <SearchX className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-mono-900 tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-mono-600 max-w-sm">{message}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center px-4 py-2 border border-mono-800 text-sm font-medium rounded-md text-mono-900 bg-white hover:bg-mono-100 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:ring-offset-2 transition-colors"
          aria-label={actionType === 'reset-filter' ? 'Reset search filters' : 'Enroll new frequent flyer'}
        >
          {actionType === 'reset-filter' ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Reset filters
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
              Enroll Frequent Flyer
            </>
          )}
        </button>
      )}
    </div>
  );
};
