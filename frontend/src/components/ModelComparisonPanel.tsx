import type { ObservationStation, DepthLevel } from '../types/ocean';
import type { StationModelComparison } from '../types/comparison';
import AgreementBadge from './AgreementBadge';
import ModelProfileChart from './ModelProfileChart';
import { formatDemoTime } from '../data/demoTime';

interface ModelComparisonPanelProps {
  station: ObservationStation;
  comparison: StationModelComparison;
  selectedDepth: DepthLevel;
}

export default function ModelComparisonPanel({ comparison, selectedDepth }: ModelComparisonPanelProps) {
  const depthComp = comparison.depthComparisons.find(d => d.depthM === selectedDepth);

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header */}
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Model vs Observation</h3>
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <span className="bg-ocean-accent/20 text-ocean-accent text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-ocean-accent/30">
            Demo comparison data
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {formatDemoTime(comparison.timeIso)}
          </span>
        </div>
        <AgreementBadge level={comparison.agreementLevel} score={comparison.overallScore} />
      </div>

      {/* 2. Disclaimer */}
      <div className="bg-[#030b14]/80 p-3 rounded border border-slate-700/50">
        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
          Demo comparison data only. This is not a validation of an operational ocean forecast.
          <br /><br />
          Observed and model values are deterministic prototype data for interface demonstration.
        </p>
      </div>

      {/* 3. Selected-depth comparison */}
      {depthComp ? (
        <div className="space-y-2">
          <div className="flex justify-between items-end border-b border-slate-800 pb-1">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Selected Depth: {selectedDepth} m
            </h4>
          </div>
          
          <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-400 uppercase tracking-wider mb-1">
            <div className="col-span-1">Variable</div>
            <div className="text-right">Observed</div>
            <div className="text-right">Model</div>
            <div className="text-right">|Diff|</div>
          </div>

          <div className="grid grid-cols-4 gap-1 items-center bg-[#030b14] p-2 rounded border border-slate-800">
            <div className="col-span-1 text-xs font-medium text-slate-300">Temp <span className="text-[10px] text-slate-500 font-normal">°C</span></div>
            <div className="text-right text-sm font-mono text-cyan-400">{depthComp.observedTemperatureC.toFixed(2)}</div>
            <div className="text-right text-sm font-mono text-orange-400">{depthComp.modelTemperatureC.toFixed(2)}</div>
            <div className="text-right text-sm font-mono text-red-400">{depthComp.temperatureAbsoluteErrorC.toFixed(2)}</div>
          </div>

          <div className="grid grid-cols-4 gap-1 items-center bg-[#030b14] p-2 rounded border border-slate-800">
            <div className="col-span-1 text-xs font-medium text-slate-300">Salinity <span className="text-[10px] text-slate-500 font-normal">PSU</span></div>
            <div className="text-right text-sm font-mono text-cyan-400">{depthComp.observedSalinityPsu.toFixed(2)}</div>
            <div className="text-right text-sm font-mono text-orange-400">{depthComp.modelSalinityPsu.toFixed(2)}</div>
            <div className="text-right text-sm font-mono text-red-400">{depthComp.salinityAbsoluteErrorPsu.toFixed(2)}</div>
          </div>

          <div className="grid grid-cols-4 gap-1 items-center bg-[#030b14] p-2 rounded border border-slate-800">
            <div className="col-span-1 text-xs font-medium text-slate-300">Speed <span className="text-[10px] text-slate-500 font-normal">m/s</span></div>
            <div className="text-right text-sm font-mono text-cyan-400">{depthComp.observedCurrentSpeedMs.toFixed(2)}</div>
            <div className="text-right text-sm font-mono text-orange-400">{depthComp.modelCurrentSpeedMs.toFixed(2)}</div>
            <div className="text-right text-sm font-mono text-red-400">{depthComp.currentSpeedAbsoluteErrorMs.toFixed(2)}</div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500">Depth data unavailable.</div>
      )}

      {/* 4. Error summary */}
      <div className="bg-slate-800/40 p-3 rounded border border-slate-700/50">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Profile Error Summary</h4>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Temp MAE:</span>
            <span className="font-mono text-white">{comparison.temperature.mae.toFixed(2)} °C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Salinity MAE:</span>
            <span className="font-mono text-white">{comparison.salinity.mae.toFixed(2)} PSU</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Speed MAE:</span>
            <span className="font-mono text-white">{comparison.currentSpeed.mae.toFixed(2)} m/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Max Temp Err:</span>
            <span className="font-mono text-white">{comparison.temperature.maxAbsoluteError.toFixed(2)} °C</span>
          </div>
        </div>
      </div>

      {/* 5. Explanation */}
      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Interpretation</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          {comparison.explanation}
        </p>
      </div>

      {/* 6. Vertical profile chart */}
      <div className="mt-2">
        <ModelProfileChart comparison={comparison} />
      </div>

      {/* 7. Detail note */}
      <p className="text-[10px] text-slate-500 italic text-center border-t border-slate-800 pt-3">
        Profile depths: 0 m, 50 m, 100 m, 200 m.
      </p>
    </div>
  );
}
