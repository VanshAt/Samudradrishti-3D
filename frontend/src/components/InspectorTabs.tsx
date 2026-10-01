import type { AgreementLevel } from '../types/comparison';

export type InspectorTab = "overview" | "comparison";

interface InspectorTabsProps {
  activeTab: InspectorTab;
  onTabChange: (tab: InspectorTab) => void;
  comparisonLevel?: AgreementLevel;
  disabled?: boolean;
}

export default function InspectorTabs({ activeTab, onTabChange, comparisonLevel, disabled }: InspectorTabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, currentTab: InspectorTab) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onTabChange(currentTab === 'overview' ? 'comparison' : 'overview');
    }
  };

  return (
    <div 
      className="flex border-b border-slate-800"
      role="tablist" 
      aria-label="Inspector Views"
    >
      <button
        role="tab"
        aria-selected={activeTab === 'overview'}
        aria-controls="panel-overview"
        id="tab-overview"
        tabIndex={activeTab === 'overview' ? 0 : -1}
        onClick={() => onTabChange('overview')}
        onKeyDown={(e) => handleKeyDown(e, 'overview')}
        className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
          activeTab === 'overview' 
            ? 'border-ocean-accent text-white' 
            : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
        }`}
      >
        Overview
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'comparison'}
        aria-controls="panel-comparison"
        id="tab-comparison"
        tabIndex={activeTab === 'comparison' ? 0 : -1}
        disabled={disabled}
        onClick={() => onTabChange('comparison')}
        onKeyDown={(e) => handleKeyDown(e, 'comparison')}
        className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
          disabled ? 'opacity-50 cursor-not-allowed border-transparent text-slate-500' :
          activeTab === 'comparison' 
            ? 'border-ocean-accent text-white' 
            : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
        }`}
      >
        Model vs Observation
        {comparisonLevel && !disabled && (
          <span 
            className={`w-2 h-2 rounded-full ${
              comparisonLevel === 'high' ? 'bg-[#22C55E]' :
              comparisonLevel === 'moderate' ? 'bg-[#F59E0B]' :
              'bg-[#EF4444]'
            }`} 
            aria-hidden="true" 
          />
        )}
      </button>
    </div>
  );
}
