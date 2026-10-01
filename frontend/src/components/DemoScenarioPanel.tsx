import { X, AlertTriangle } from "lucide-react";
import type { DemoScenario } from "../types/alerts";
import type { TimeIndex } from "../types/ocean";

interface DemoScenarioPanelProps {
  isOpen: boolean;
  scenario: DemoScenario | null;
  activeTimeIndex: TimeIndex;
  onLaunch: () => void;
  onClose: () => void;
}

export function DemoScenarioPanel({ isOpen, scenario, onClose }: DemoScenarioPanelProps) {
  if (!isOpen || !scenario) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl p-6 w-[450px] max-w-full z-50">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
        <h2 className="text-xl font-bold text-slate-100">{scenario.title}</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4 text-slate-300 text-sm">
        <p className="leading-relaxed">
          {scenario.description}
        </p>
        
        <div className="bg-slate-800 p-3 rounded border border-slate-700">
          <h3 className="font-semibold text-slate-200 mb-1">Recommended Action</h3>
          <p className="italic">{scenario.recommendedDemoAction}</p>
        </div>

        <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-bold text-red-400 text-xs uppercase tracking-wider mb-1">Mandatory Warning</span>
            <p className="text-sm text-red-200 leading-snug">
              Demo alert logic based on deterministic prototype thresholds. Not an operational marine warning.
              Do not use this prototype for navigation, emergency response, or safety decisions.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors border border-slate-600"
        >
          Close Scenario Panel
        </button>
      </div>
    </div>
  );
}
