
import { Crosshair, X, AlertTriangle } from "lucide-react";
import type { OceanAlert } from "../types/alerts";
import { AlertBadge } from "./AlertBadge";
import { formatDemoTime } from "../data/demoTime";

interface AlertDetailPanelProps {
  alert: OceanAlert | null;
  onFocusAlert: () => void;
  onClear: () => void;
}

export function AlertDetailPanel({ alert, onFocusAlert, onClear }: AlertDetailPanelProps) {
  if (!alert) return null;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col gap-3 shadow-lg mb-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Selected Demo Alert
          </div>
          <div className="flex items-center gap-2 mt-1">
            <AlertBadge severity={alert.severity} />
            <h2 className="text-lg font-bold text-slate-100">{alert.title}</h2>
          </div>
        </div>
        <button
          onClick={onClear}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors"
          title="Clear Alert"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-1 text-sm text-slate-300">
        <div className="flex justify-between items-center py-1 border-b border-slate-800">
          <span className="text-slate-400">Time (UTC):</span>
          <span className="font-medium text-slate-200">{formatDemoTime(alert.timeIso)}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-slate-800">
          <span className="text-slate-400">Platform:</span>
          <span className="font-medium text-slate-200">{alert.stationName || alert.stationId}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-slate-800">
          <span className="text-slate-400">Alert Type:</span>
          <span className="font-medium text-slate-200 capitalize">{alert.type}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <h3 className="text-sm font-semibold text-slate-300">Trigger Reasons</h3>
        {alert.reasons.map((r, i) => (
          <div key={i} className="bg-slate-800 rounded p-2 text-sm border border-slate-700">
            <div className="font-semibold text-slate-200 mb-1">{r.label}</div>
            <div className="text-slate-300 mb-1">{r.detail}</div>
            <div className="text-xs text-slate-400 font-mono bg-slate-900 p-1 rounded inline-block">
              {r.threshold}
            </div>
            {r.measuredValue && (
              <div className="text-xs text-slate-400 mt-1">
                Measured: {r.measuredValue}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <h3 className="text-sm font-semibold text-slate-300">Recommended Demo Action</h3>
        <p className="text-sm text-slate-300 bg-slate-800 p-3 rounded italic border-l-2 border-slate-500">
          {alert.recommendedAction}
        </p>
      </div>

      <div className="flex items-start gap-2 p-3 mt-2 bg-red-950/30 border border-red-900/50 rounded">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-200 font-medium">
          Do not use this prototype for navigation, emergency response, or safety decisions.
        </p>
      </div>

      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-800">
        <button
          onClick={onFocusAlert}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
        >
          <Crosshair className="w-4 h-4" />
          Focus on Map
        </button>
      </div>
    </div>
  );
}
