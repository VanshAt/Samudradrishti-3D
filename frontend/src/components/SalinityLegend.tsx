import type { DepthLevel, OceanVariable, TimeIndex } from '../types/ocean';
import { formatDemoTime } from "../data/demoTime";

interface SalinityLegendProps {
  activeVariable: OceanVariable | null;
  selectedDepth: DepthLevel;
  minValue: number;
  maxValue: number;
  timeIso: string;
  timeIndex: TimeIndex;
}

export default function SalinityLegend({ 
  activeVariable, 
  selectedDepth, 
  minValue, 
  maxValue,
  timeIso
}: SalinityLegendProps) {
  if (activeVariable !== "salinity") return null;

  // 6 stops for labels
  const stops = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const range = maxValue - minValue;

  return (
    <div className="absolute bottom-10 left-4 bg-ocean-panel/90 border border-cyan-900/50 p-4 rounded shadow-lg backdrop-blur-md pointer-events-none z-10 w-48">
      <div className="text-sm font-bold text-white mb-1 flex items-center justify-between">
        <span>Salinity</span>
        <span className="text-xs text-slate-400 font-normal">PSU</span>
      </div>
      <div className="text-xs text-slate-400 mb-3 pb-2 border-b border-cyan-900/50">
        <div>Model slice • {selectedDepth} m</div>
        <div className="text-[10px] mt-1 text-slate-500">{formatDemoTime(timeIso)}</div>
        <div className="text-[10px] mt-1 text-slate-500">Demo numerical model data</div>
        <div className="text-[10px] mt-1 text-slate-500">Demo time series &bull; deterministic local data</div>
      </div>
      
      <div className="flex gap-3 h-48">
        <div 
          className="w-4 rounded-full border border-slate-700 h-full"
          style={{
            background: `linear-gradient(to top, #6D28D9, #2563EB, #06B6D4, #14B8A6, #84CC16, #FACC15)`
          }}
        />
        
        <div className="flex flex-col justify-between h-full text-xs font-mono text-slate-300 py-1">
          {stops.reverse().map(stop => {
            const val = minValue + (range * stop);
            return <span key={stop}>{val.toFixed(1)}</span>;
          })}
        </div>
      </div>
    </div>
  );
}
