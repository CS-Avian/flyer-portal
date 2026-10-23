import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  label = 'Processing request...',
  size = 'md',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  };

  const spinner = (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center space-x-3 p-4 text-mono-800"
    >
      <Loader2
        className={`animate-spin text-mono-900 ${sizeClasses[size].split(' ')[0]} ${
          sizeClasses[size].split(' ')[1]
        }`}
        aria-hidden="true"
      />
      <span className={`font-medium ${sizeClasses[size].split(' ')[2]}`}>{label}</span>
      <span className="sr-only">Loading, please wait</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-mono-950/40 backdrop-blur-sm"
        aria-modal="true"
        role="dialog"
      >
        <div className="bg-mono-50 border border-mono-300 rounded-lg shadow-xl p-6 flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-mono-900 mb-3" aria-hidden="true" />
          <p className="text-mono-900 font-semibold text-base">{label}</p>
          <p className="text-mono-500 text-xs mt-1">Connecting to flight operations network</p>
        </div>
      </div>
    );
  }

  return spinner;
};
