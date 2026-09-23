import React from 'react';
import { Waves, Settings, Map, Clock, AlertTriangle, Info, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

function App() {
  return (
    <div className="flex flex-col h-screen w-full bg-ocean-dark text-slate-200 font-sans">
      {/* 1. Top Header */}
      <header className="h-14 bg-ocean-panel border-b border-cyan-900/50 flex items-center justify-between px-4 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-ocean-accent/20 rounded-md text-ocean-accent">
            <Waves size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">SamudraDrishti 3D</h1>
            <p className="text-xs text-cyan-300/70">Integrated Ocean Intelligence Platform</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-ocean-dark/50 rounded-full border border-ocean-accent/30">
            <span className="w-2 h-2 rounded-full bg-ocean-accent animate-pulse"></span>
            <span className="text-xs font-medium text-ocean-accent">Demo Dataset • Bay of Bengal</span>
          </div>
          <button className="px-3 py-1.5 text-xs font-medium bg-ocean-dark hover:bg-slate-800 rounded border border-slate-700 transition-colors">
            Reset View
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 2. Left Control Panel */}
        <aside className="w-64 bg-ocean-panel border-r border-cyan-900/50 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-cyan-900/50">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Settings size={16} className="text-ocean-accent" />
              Layer Controls
            </h2>
          </div>
          
          <div className="p-4 flex flex-col gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ocean Fields</h3>
              {['Sea Surface Temperature', 'Salinity', 'Ocean Currents'].map(layer => (
                <label key={layer} className="flex items-center gap-3 text-sm cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-ocean-dark text-ocean-accent focus:ring-ocean-accent focus:ring-offset-ocean-dark" />
                  <span className="group-hover:text-white transition-colors">{layer}</span>
                </label>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Observations</h3>
              {['ARGO Floats', 'Mooring Buoys', 'Gliders'].map(obs => (
                <label key={obs} className="flex items-center gap-3 text-sm cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-ocean-dark text-ocean-accent focus:ring-ocean-accent focus:ring-offset-ocean-dark" defaultChecked />
                  <span className="group-hover:text-white transition-colors">{obs}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* 3. Main 3D Viewer Area */}
        <main className="flex-1 relative bg-[#030b14] flex flex-col items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 p-8 bg-ocean-panel/80 backdrop-blur-sm border border-cyan-900/50 rounded-xl shadow-2xl max-w-md mx-4">
              <Map size={48} className="mx-auto text-ocean-accent opacity-80" />
              <h2 className="text-xl font-bold text-white">3D Ocean Viewer</h2>
              <p className="text-slate-400 text-sm">
                Cesium Integration in Phase 3. The 3D globe will render here, centered on the Bay of Bengal.
              </p>
            </div>
          </div>
          
          {/* Depth Indicator Placeholder */}
          <div className="absolute top-4 left-4 bg-ocean-panel/90 border border-cyan-900/50 px-3 py-2 rounded shadow-lg backdrop-blur-md">
            <div className="text-xs text-slate-400">Current Depth</div>
            <div className="text-lg font-bold text-ocean-accent">0 m <span className="text-xs font-normal text-slate-300">(Surface)</span></div>
          </div>
        </main>

        {/* 5. Right Information Panel */}
        <aside className="w-80 bg-ocean-panel border-l border-cyan-900/50 flex flex-col shrink-0">
          <div className="p-4 border-b border-cyan-900/50">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Info size={16} className="text-ocean-accent" />
              Station Inspector
            </h2>
          </div>
          
          <div className="flex-1 p-6 flex items-center justify-center text-center">
            <div className="space-y-3">
              <AlertTriangle size={32} className="mx-auto text-slate-500" />
              <p className="text-sm text-slate-400 leading-relaxed">
                Select an observation station to inspect its profile and compare it with nearby ocean-model output.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* 4. Bottom Timeline */}
      <footer className="h-16 bg-ocean-panel border-t border-cyan-900/50 shrink-0 flex items-center px-4 gap-6 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors">
            <SkipBack size={18} />
          </button>
          <button className="p-2 bg-ocean-accent/20 hover:bg-ocean-accent/30 rounded text-ocean-accent transition-colors">
            <Play size={18} className="ml-0.5" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors">
            <SkipForward size={18} />
          </button>
        </div>
        
        <div className="flex-1 flex items-center gap-4">
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-ocean-accent rounded-full"></div>
            {/* Markers placeholder */}
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-ocean-accent rounded-full shadow cursor-pointer"></div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-300 bg-ocean-dark/50 px-3 py-1.5 rounded border border-slate-700">
          <Clock size={14} className="text-ocean-accent" />
          <span className="font-mono">2026-09-23 12:00 UTC</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
