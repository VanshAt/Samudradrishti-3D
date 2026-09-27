import { useMemo } from 'react';
import type { ObservationStation, OceanVariable, DepthLevel } from '../types/ocean';
import { calculateOceanConditionInsight } from '../utils/oceanConditionInsight';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface OceanConditionInsightPanelProps {
  station: ObservationStation | null;
  activeVariable: OceanVariable | null;
  selectedDepth: DepthLevel;
}

export default function OceanConditionInsightPanel({ 
  station, 
  activeVariable, 
  selectedDepth 
}: OceanConditionInsightPanelProps) {
  
  const insight = useMemo(() => {
    if (!station) return null;
    return calculateOceanConditionInsight(station, activeVariable, selectedDepth);
  }, [station, activeVariable, selectedDepth]);

  if (!insight) return null;

  const isRoutine = insight.severity === 'routine';
  const isCaution = insight.severity === 'caution';
  
  const colorClass = isRoutine ? 'text-green-400' : isCaution ? 'text-amber-400' : 'text-red-400';
  const bgClass = isRoutine ? 'bg-green-900/20 border-green-700/50' : isCaution ? 'bg-amber-900/20 border-amber-700/50' : 'bg-red-900/20 border-red-700/50';

  return (
    <div className={`mt-4 p-3 rounded border ${bgClass}`}>
      <div className="flex justify-between items-center mb-2 border-b border-slate-700/50 pb-2">
        <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 uppercase tracking-wider">
          {isRoutine ? <CheckCircle2 size={14} className={colorClass} /> : isCaution ? <AlertCircle size={14} className={colorClass} /> : <ShieldAlert size={14} className={colorClass} />}
          Ocean Condition Insight
        </h4>
        <span className={`text-xs font-mono font-bold ${colorClass}`}>
          {insight.score} / 100
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 items-center">
          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-slate-800 ${colorClass}`}>
            {insight.severity}
          </span>
          <p className="text-xs text-slate-300 leading-tight">
            {insight.summary}
          </p>
        </div>

        {insight.reasons.length > 0 && (
          <ul className="space-y-1.5 pl-1">
            {insight.reasons.map((r, i) => (
              <li key={i} className="text-xs">
                <span className="text-slate-200 font-medium">{r.label}:</span>{" "}
                <span className="text-slate-400">{r.detail}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="text-[11px] text-slate-300 bg-black/20 p-2 rounded border border-slate-700/50">
          <span className="font-semibold text-white">Action:</span> {insight.recommendedAction}
        </div>

        <div className="text-[9px] text-slate-500 uppercase tracking-widest text-center">
          Explainable demo ocean insight based on configured thresholds. Not an operational forecast or trained ML model.
        </div>
      </div>
    </div>
  );
}
