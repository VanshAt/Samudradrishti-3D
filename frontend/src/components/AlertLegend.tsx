

export function AlertLegend() {
  return (
    <div className="absolute bottom-[60px] left-2 bg-slate-900/80 border border-slate-700/80 rounded p-2 pointer-events-none z-10 backdrop-blur-sm">
      <h4 className="text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wide">
        Demo Alert Priority
      </h4>
      <div className="flex flex-col gap-1.5 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500"></div>
          <span className="text-xs text-slate-300">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500"></div>
          <span className="text-xs text-slate-300">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-sky-400/80 border border-sky-400"></div>
          <span className="text-xs text-slate-300">Low</span>
        </div>
      </div>
      <div className="text-[9px] text-slate-400 border-t border-slate-700 pt-1">
        Demo thresholds • not operational guidance
      </div>
    </div>
  );
}
