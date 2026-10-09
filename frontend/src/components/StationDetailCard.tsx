import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { ObservationStation, DepthLevel } from '../types/ocean';
import type { OceanAlert } from '../types/alerts';
import { formatDemoTime } from '../data/demoTime';

interface StationDetailCardProps {
  station: ObservationStation;
  selectedDepth: DepthLevel;
  alerts: OceanAlert[];
  onClose: () => void;
}

export const StationDetailCard: React.FC<StationDetailCardProps> = ({
  station,
  selectedDepth,
  alerts,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Find if station has an alert
  const stationAlerts = alerts.filter((a) => a.stationId === station.id);
  // Get highest severity alert if multiple
  const highestSeverity = stationAlerts.some((a) => a.severity === 'high')
    ? 'high'
    : stationAlerts.some((a) => a.severity === 'medium')
    ? 'medium'
    : stationAlerts.length > 0
    ? 'low'
    : null;

  const getPriorityColor = (severity: 'high' | 'medium' | 'low' | null) => {
    if (severity === 'high') return 'bg-red-500/20 text-red-400 border-red-500/50';
    if (severity === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    if (severity === 'low') return 'bg-sky-500/20 text-sky-400 border-sky-500/50';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
  };

  const getPriorityLabel = (severity: 'high' | 'medium' | 'low' | null) => {
    if (severity === 'high') return 'High Priority';
    if (severity === 'medium') return 'Medium Priority';
    if (severity === 'low') return 'Low Priority';
    return 'Normal / No Alerts';
  };

  const formatLat = (lat: number) => {
    const dir = lat >= 0 ? 'N' : 'S';
    return `${Math.abs(lat).toFixed(2)}° ${dir}`;
  };

  const formatLon = (lon: number) => {
    const dir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lon).toFixed(2)}° ${dir}`;
  };

  return (
    <div className="bg-ocean-panel border border-cyan-900/50 rounded-lg shadow-2xl p-4 w-80 max-w-[calc(100vw-2rem)] pointer-events-auto backdrop-blur-md">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-white">{station.name}</h3>
          <p className="text-xs font-mono text-ocean-accent">{station.id}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close station detail card"
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Location:</span>
          <span className="font-mono text-slate-200">
            {formatLat(station.latitude)}, {formatLon(station.longitude)}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Time:</span>
          <span className="text-slate-200">
            {station.timestamp ? formatDemoTime(station.timestamp) : 'Demo observation time'}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Selected Depth:</span>
          <span className="font-mono text-slate-200">{selectedDepth} m</span>
        </div>

        <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-700/50">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Temp</div>
            <div className="font-mono text-sm text-slate-200">
              {station.latestObservation?.temperatureC !== undefined
                ? `${station.latestObservation.temperatureC.toFixed(2)} °C`
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Salinity</div>
            <div className="font-mono text-sm text-slate-200">
              {station.latestObservation?.salinityPsu !== undefined
                ? `${station.latestObservation.salinityPsu.toFixed(2)} PSU`
                : 'N/A'}
            </div>
          </div>
        </div>

        <div className="pt-1">
          <div className="text-[10px] text-slate-400 uppercase mb-1">Alert Status</div>
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-bold ${getPriorityColor(
              highestSeverity
            )}`}
          >
            {highestSeverity && <AlertTriangle size={12} />}
            {getPriorityLabel(highestSeverity)}
          </div>
        </div>

        <div className="pt-2 space-y-1">
          <p className="text-[10px] text-slate-500 italic leading-tight">
            Prototype/synthetic observation unless explicitly identified as a verified live source.
          </p>
          <p className="text-[10px] text-slate-500 italic leading-tight">
            Context: compared against the currently rendered model layer at the selected depth and time.
          </p>
        </div>
      </div>
    </div>
  );
};
