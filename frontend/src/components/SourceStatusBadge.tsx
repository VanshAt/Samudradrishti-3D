import React from 'react';
import type { DataSourceId, SourceStatus } from '../types/api';

interface SourceStatusBadgeProps {
  selectedSourceId: DataSourceId;
  sources: SourceStatus[];
  error: string | null;
}

export const SourceStatusBadge: React.FC<SourceStatusBadgeProps> = ({
  selectedSourceId,
  sources,
  error
}) => {
  const currentSource = sources.find(s => s.id === selectedSourceId);

  if (error) {
    return (
      <div className="flex flex-col gap-1" aria-live="polite">
        <div className="inline-flex items-center gap-2 bg-red-900/60 border border-red-700/50 text-red-200 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm max-w-md">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="truncate">{error}</span>
        </div>
      </div>
    );
  }

  if (!currentSource) return null;

  let bgColor = "bg-gray-800/80 border-gray-600/50";
  let textColor = "text-gray-300";
  let iconColor = "text-gray-400";

  if (selectedSourceId === 'local_demo') {
    bgColor = "bg-emerald-900/40 border-emerald-700/30";
    textColor = "text-emerald-200";
    iconColor = "text-emerald-400";
  } else if (selectedSourceId === 'backend_demo') {
    bgColor = "bg-indigo-900/40 border-indigo-700/30";
    textColor = "text-indigo-200";
    iconColor = "text-indigo-400";
  } else if (selectedSourceId === 'archived_dataset') {
    bgColor = "bg-cyan-900/40 border-cyan-700/30";
    textColor = "text-cyan-200";
    iconColor = "text-cyan-400";
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className={`inline-flex items-center gap-2 ${bgColor} border px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm transition-all`}>
        <svg className={`w-4 h-4 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
        <span className={textColor}>{currentSource.label}</span>
      </div>

      {selectedSourceId === 'archived_dataset' && currentSource.lastProcessedAt && (
        <div className="text-[10px] text-gray-400 mr-2">
          Processed: {new Date(currentSource.lastProcessedAt).toLocaleString()}
        </div>
      )}

      {currentSource.description && selectedSourceId !== 'local_demo' && (
        <div className="text-[10px] text-gray-500 mr-2 max-w-xs text-right opacity-80 hover:opacity-100 transition-opacity">
          {currentSource.description}
        </div>
      )}
    </div>
  );
};
