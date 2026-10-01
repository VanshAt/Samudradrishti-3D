import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import type { OceanAlert, AlertFilters, AlertSeverity, AlertType } from "../types/alerts";
import { AlertBadge } from "./AlertBadge";
import { formatDemoTimeShort } from "../data/demoTime";

interface AlertCenterProps {
  alerts: OceanAlert[];
  filters: AlertFilters;
  selectedAlertId: string | null;
  onFiltersChange: (filters: AlertFilters) => void;
  onSelectAlert: (alert: OceanAlert) => void;
  onClearSelection: () => void;
}

const SEVERITIES: AlertSeverity[] = ["high", "medium", "low"];
const TYPES: AlertType[] = ["current", "wave", "mismatch", "quality"];

export function AlertCenter({
  alerts,
  filters,
  selectedAlertId,
  onFiltersChange,
  onSelectAlert,
  onClearSelection
}: AlertCenterProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSeverity = (sev: AlertSeverity) => {
    let newSevs = [...filters.severities];
    if (newSevs.includes(sev)) {
      newSevs = newSevs.filter(s => s !== sev);
    } else {
      newSevs.push(sev);
    }
    onFiltersChange({ ...filters, severities: newSevs });
  };

  const toggleType = (type: AlertType) => {
    let newTypes = [...filters.types];
    if (newTypes.includes(type)) {
      newTypes = newTypes.filter(t => t !== type);
    } else {
      newTypes.push(type);
    }
    onFiltersChange({ ...filters, types: newTypes });
  };

  const clearSeverityFilters = () => onFiltersChange({ ...filters, severities: [] });
  const clearTypeFilters = () => onFiltersChange({ ...filters, types: [] });

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex flex-col mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-3 bg-slate-800 hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
          <h2 className="text-sm font-semibold text-slate-200">Alert Center</h2>
          <span className="text-xs text-slate-400">Alerts ({alerts.length})</span>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 rounded-full border border-amber-500/20">
          Demo only
        </span>
      </button>

      {isExpanded && (
        <div className="flex flex-col flex-1 p-3 gap-3 border-t border-slate-700">
          <div className="flex items-start gap-2 p-2 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-300">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-amber-500">Demo alert logic</strong> based on deterministic prototype thresholds. Not an operational marine warning.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {/* Severity Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 w-12">Priority:</span>
              <button
                onClick={clearSeverityFilters}
                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                  filters.severities.length === 0
                    ? "bg-slate-700 text-white border-slate-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                }`}
              >
                All
              </button>
              {SEVERITIES.map(sev => (
                <button
                  key={sev}
                  onClick={() => toggleSeverity(sev)}
                  className={`px-2 py-1 text-xs rounded-full border capitalize transition-colors ${
                    filters.severities.includes(sev)
                      ? sev === "high" ? "bg-red-500/20 text-red-400 border-red-500/50"
                        : sev === "medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                        : "bg-sky-400/20 text-sky-400 border-sky-400/50"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 w-12">Type:</span>
              <button
                onClick={clearTypeFilters}
                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                  filters.types.length === 0
                    ? "bg-slate-700 text-white border-slate-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                }`}
              >
                All
              </button>
              {TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-2 py-1 text-xs rounded-full border capitalize transition-colors ${
                    filters.types.includes(type)
                      ? "bg-slate-700 text-white border-slate-500"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-4 italic">
                No demo alerts match the current filters.
              </div>
            ) : (
              alerts.map(alert => {
                const isSelected = alert.id === selectedAlertId;
                return (
                  <div
                    key={alert.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => isSelected ? onClearSelection() : onSelectAlert(alert)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        isSelected ? onClearSelection() : onSelectAlert(alert);
                      }
                    }}
                    className={`flex flex-col gap-1 p-2 rounded border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-slate-800 border-blue-500 ring-1 ring-blue-500"
                        : "bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertBadge severity={alert.severity} compact />
                        <span className="text-sm font-semibold text-slate-200">
                          {alert.title}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatDemoTimeShort(alert.timeIso)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      {alert.stationName || alert.stationId}
                    </div>
                    {alert.reasons[0] && (
                      <div className="text-xs text-slate-400 truncate">
                        {alert.reasons[0].detail}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="text-[10px] text-slate-500 text-center mt-1">
            Alerts update with the selected demo time step.
          </div>
        </div>
      )}
    </div>
  );
}
