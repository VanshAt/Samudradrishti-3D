import type { DepthLevel, OceanVariable } from '../types/ocean';

interface CurrentLegendProps {
  activeVariable: OceanVariable | null;
  selectedDepth: DepthLevel;
  minValue: number;
  maxValue: number;
}

export default function CurrentLegend({ 
  activeVariable, 
  selectedDepth, 
  minValue, 
  maxValue 
}: CurrentLegendProps) {
  if (activeVariable !== "currents") return null;

  // 4 stops for labels
  const stops = [0, 0.33, 0.66, 1.0];
  const range = maxValue - minValue;

  return (
    <div className="absolute bottom-10 left-4 bg-ocean-panel/90 border border-cyan-900/50 p-4 rounded shadow-lg backdrop-blur-md pointer-events-none z-10 w-48">
      <div className="text-sm font-bold text-white mb-1 flex items-center justify-between">
        <span>Current Speed</span>
        <span className="text-xs text-slate-400 font-normal">m/s</span>
      </div>
      <div className="text-xs text-slate-400 mb-3 pb-2 border-b border-cyan-900/50">
        <div>Vector field • {selectedDepth} m</div>
        <div className="text-[10px] mt-1 text-slate-500">Demo numerical model data</div>
      </div>
      
      <div className="flex gap-3 h-32">
        <div 
          className="w-4 rounded-full border border-slate-700 h-full"
          style={{
            background: `linear-gradient(to top, #38BDF8, #22C55E, #F59E0B, #EF4444)`
          }}
        />
        
        <div className="flex flex-col justify-between h-full text-xs font-mono text-slate-300 py-1">
          {stops.reverse().map(stop => {
            const val = minValue + (range * stop);
            return <span key={stop}>{val.toFixed(2)}</span>;
          })}
        </div>
      </div>
      <div className="mt-3 text-[10px] text-slate-400 border-t border-cyan-900/50 pt-2">
        Arrows show water-flow direction.
      </div>
    </div>
  );
}
