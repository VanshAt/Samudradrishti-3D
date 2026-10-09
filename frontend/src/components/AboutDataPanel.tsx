import React, { useState, useEffect, useRef } from 'react';
import { Info, X } from 'lucide-react';
import type { DataSourceId } from '../types/api';

interface AboutDataPanelProps {
  selectedDataSource: DataSourceId;
}

export const AboutDataPanel: React.FC<AboutDataPanelProps> = ({ selectedDataSource }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  let title = '';
  let description = '';
  let badgeLabel = '';
  let additionalNote = '';

  if (selectedDataSource === 'local_demo') {
    title = 'Local Demo';
    description = 'Deterministic prototype data generated locally for fast, reliable offline demonstrations.';
    badgeLabel = 'Prototype data';
  } else if (selectedDataSource === 'backend_demo') {
    title = 'Backend Demo API';
    description = 'Deterministic prototype data served through the FastAPI backend to demonstrate the frontend-to-backend ocean-data workflow.';
    badgeLabel = 'Prototype API data';
  } else if (selectedDataSource === 'archived_dataset') {
    title = 'Archived Dataset';
    description = 'Historical ocean reanalysis subset based on Copernicus Marine GLORYS12V1, prepared for interactive visualization.';
    badgeLabel = 'Archived reanalysis';
    additionalNote = 'Layer requests may be spatially downsampled to keep the 3D browser view responsive.';
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="about-data-panel"
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-ocean-accent bg-ocean-dark/50 hover:bg-ocean-accent/10 border border-ocean-accent/30 rounded transition-colors w-full justify-center shadow-sm"
      >
        <Info size={14} />
        About Data
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            ref={panelRef}
            id="about-data-panel"
            className="bg-ocean-panel border border-cyan-900/50 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-data-title"
          >
            <div className="flex items-center justify-between p-4 border-b border-cyan-900/50 bg-ocean-dark">
              <h2 id="about-data-title" className="text-sm font-bold text-white flex items-center gap-2">
                <Info size={16} className="text-ocean-accent" />
                Data Source Information
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="text-lg font-bold text-ocean-accent leading-tight">{title}</h3>
                  <span className="shrink-0 px-2 py-1 text-[10px] font-bold uppercase rounded border bg-cyan-900/40 text-cyan-300 border-cyan-700/50">
                    {badgeLabel}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {description}
                </p>
                {additionalNote && (
                  <p className="text-xs text-slate-400 mt-2 italic">
                    Note: {additionalNote}
                  </p>
                )}
              </div>

              <div className="border-t border-cyan-900/50 pt-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Important context
                </h4>
                <ul className="space-y-2 text-xs text-slate-300 list-disc pl-4 marker:text-cyan-700">
                  <li>
                    Station markers in this prototype are synthetic/demo observations unless explicitly identified as a verified live source.
                  </li>
                  <li>
                    Alert thresholds are for visualization and demonstration only; they are not operational marine-safety guidance.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
