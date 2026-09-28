import type { DepthLevel, TimeIndex } from "../types/ocean";
import { formatDemoTime } from "../data/demoTime";

interface TemperatureLegendProps {
  showTemperature: boolean;
  selectedDepth: DepthLevel;
  minValue: number;
  maxValue: number;
  timeIso: string;
  timeIndex: TimeIndex;
}

export default function TemperatureLegend({
  showTemperature,
  selectedDepth,
  minValue,
  maxValue,
  timeIso,
}: TemperatureLegendProps) {
  if (!showTemperature) return null;

  // Use the same colors defined in oceanColors.ts
  const gradientStops = [
    "#163B8C", // cold
    "#00A6FB", // cool
    "#21D4B4", // moderate
    "#F7E733", // warm
    "#F97316", // hot
    "#DC2626", // very hot
  ].join(", ");

  // Create intermediate labels
  const range = maxValue - minValue;
  const labels = [
    maxValue,
    minValue + range * 0.8,
    minValue + range * 0.6,
    minValue + range * 0.4,
    minValue + range * 0.2,
    minValue,
  ];

  return (
    <div className="pointer-events-none absolute bottom-24 left-5 z-20 w-48 rounded-lg border border-cyan-900/50 bg-[#061522]/90 p-4 shadow-xl backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#E6FBFF]">Temperature</h3>
        <span className="text-xs font-semibold text-[#8EB7C2]">°C</span>
      </div>

      <div className="mb-3 text-[10px] uppercase tracking-wider text-[#00D4D8]">
        Model slice • {selectedDepth} m
      </div>

      <div className="flex h-40 w-full gap-3">
        {/* Color Gradient Bar */}
        <div
          className="h-full w-4 rounded-full border border-slate-700/50"
          style={{
            background: `linear-gradient(to bottom, ${gradientStops})`,
          }}
        />

        {/* Value Labels */}
        <div className="flex h-full flex-col justify-between text-xs font-mono text-slate-300">
          {labels.map((val, idx) => (
            <span key={idx} className="flex items-center">
              {val.toFixed(1)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-2 text-center text-[9px] text-slate-500">
        <div>{formatDemoTime(timeIso)}</div>
        <div className="mt-1">Demo numerical model data</div>
        <div className="mt-1">Demo time series &bull; deterministic local data</div>
      </div>
    </div>
  );
}
