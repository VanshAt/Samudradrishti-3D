import React from 'react';
import type { DataSourceId, SourceStatus } from '../types/api';

interface DataSourceSelectorProps {
  sources: SourceStatus[];
  selectedSource: DataSourceId;
  isLoading: boolean;
  onSelectSource: (source: DataSourceId) => void;
}

export const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
  sources,
  selectedSource,
  isLoading,
  onSelectSource,
}) => {
  return (
    <div className="bg-gray-800/90 border border-gray-700/50 rounded-xl p-4 shadow-xl backdrop-blur-sm mb-4 transition-all">
      <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-3">Data Source</h3>

      <div className="flex flex-col gap-2">
        {sources.map((source) => (
          <label
            key={source.id}
            className={`
              flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer
              ${selectedSource === source.id
                ? 'bg-blue-900/40 border-blue-500/50 shadow-inner'
                : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'}
              ${(!source.available || isLoading) && selectedSource !== source.id ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name="dataSource"
              value={source.id}
              checked={selectedSource === source.id}
              onChange={() => !isLoading && source.available && onSelectSource(source.id)}
              disabled={isLoading || !source.available}
              className="mt-1 text-blue-500 bg-gray-900 border-gray-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`font-medium ${selectedSource === source.id ? 'text-blue-100' : 'text-gray-200'}`}>
                  {source.id === 'local_demo' ? 'Local Demo' :
                   source.id === 'backend_demo' ? 'Backend Demo API' :
                   'Archived Dataset'}
                </span>
                {!source.available && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 bg-red-900/30 px-2 py-0.5 rounded">
                    Unavailable
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {source.description}
              </p>
            </div>
          </label>
        ))}
      </div>

      {isLoading && (
        <div className="mt-3 text-xs text-blue-300 flex items-center justify-center gap-2 animate-pulse">
          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          Switching data source...
        </div>
      )}
    </div>
  );
};
