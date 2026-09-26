import { useRef, useState, useEffect } from 'react';
import { Waves, Settings, Clock, AlertTriangle, Info, Play, SkipBack, SkipForward, X } from 'lucide-react';
import OceanViewer from './components/OceanViewer';
import type { OceanViewerRef } from './components/OceanViewer';
import { demoStations } from './data/demoStations';
import type { ObservationStation } from './types/ocean';

function App() {
  const viewerRef = useRef<OceanViewerRef>(null);

  const [showArgo, setShowArgo] = useState(true);
  const [showBuoys, setShowBuoys] = useState(true);
  const [showGliders, setShowGliders] = useState(true);
  const [selectedStation, setSelectedStation] = useState<ObservationStation | null>(null);

  useEffect(() => {
    if (!selectedStation) {
      return;
    }

    const selectedTypeIsHidden =
      (selectedStation.type === "argo" && !showArgo) ||
      (selectedStation.type === "buoy" && !showBuoys) ||
      (selectedStation.type === "glider" && !showGliders);

    if (selectedTypeIsHidden) {
      setSelectedStation(null);
    }
  }, [selectedStation, showArgo, showBuoys, showGliders]);

  const handleResetView = () => {
    if (viewerRef.current) {
      viewerRef.current.resetView();
    }
  };

  const argoCount = demoStations.filter(s => s.type === 'argo').length;
  const buoyCount = demoStations.filter(s => s.type === 'buoy').length;
  const gliderCount = demoStations.filter(s => s.type === 'glider').length;

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
          <button
            onClick={handleResetView}
            className="px-3 py-1.5 text-xs font-medium bg-ocean-dark hover:bg-slate-800 rounded border border-slate-700 transition-colors"
          >
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
              
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={showArgo}
                  onChange={(e) => setShowArgo(e.target.checked)}
                  aria-label="Toggle ARGO Floats"
                  className="w-4 h-4 rounded border-slate-600 bg-ocean-dark text-ocean-accent focus:ring-ocean-accent focus:ring-offset-ocean-dark" 
                />
                <span className="w-3 h-3 rounded-full bg-cyan-400 border border-cyan-200"></span>
                <span className="group-hover:text-white transition-colors">ARGO Floats ({argoCount})</span>
              </label>

              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={showBuoys}
                  onChange={(e) => setShowBuoys(e.target.checked)}
                  aria-label="Toggle Mooring Buoys"
                  className="w-4 h-4 rounded border-slate-600 bg-ocean-dark text-ocean-accent focus:ring-ocean-accent focus:ring-offset-ocean-dark" 
                />
                <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-200"></span>
                <span className="group-hover:text-white transition-colors">Mooring Buoys ({buoyCount})</span>
              </label>

              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={showGliders}
                  onChange={(e) => setShowGliders(e.target.checked)}
                  aria-label="Toggle Gliders"
                  className="w-4 h-4 rounded border-slate-600 bg-ocean-dark text-ocean-accent focus:ring-ocean-accent focus:ring-offset-ocean-dark" 
                />
                <span className="w-3 h-3 rounded-full bg-purple-400 border border-purple-200"></span>
                <span className="group-hover:text-white transition-colors">Gliders ({gliderCount})</span>
              </label>

            </div>
          </div>
        </aside>

        {/* 3. Main 3D Viewer Area */}
        <main className="flex-1 relative bg-[#030b14] flex flex-col items-center justify-center">
          <OceanViewer 
            ref={viewerRef} 
            showArgo={showArgo}
            showBuoys={showBuoys}
            showGliders={showGliders}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
          />

          {/* Depth Indicator Placeholder */}
          <div className="absolute top-4 left-4 bg-ocean-panel/90 border border-cyan-900/50 px-3 py-2 rounded shadow-lg backdrop-blur-md">
            <div className="text-xs text-slate-400">Current Depth</div>
            <div className="text-lg font-bold text-ocean-accent">0 m <span className="text-xs font-normal text-slate-300">(Surface)</span></div>
          </div>
        </main>

        {/* 5. Right Information Panel */}
        <aside className="w-80 bg-ocean-panel border-l border-cyan-900/50 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-cyan-900/50">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Info size={16} className="text-ocean-accent" />
              Station Inspector
            </h2>
          </div>

          {!selectedStation ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="space-y-4">
                <AlertTriangle size={36} className="mx-auto text-slate-500" />
                <p className="text-sm text-slate-300">
                  Select an ARGO float, buoy, or glider to inspect observations and model comparison.
                </p>
                <p className="text-xs text-slate-500">
                  Live model comparison and vertical profiles will be available in later phases.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedStation.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedStation.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedStation(null)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  aria-label="Clear selection"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex gap-2">
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                  selectedStation.type === 'argo' ? 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50' : 
                  selectedStation.type === 'buoy' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' :
                  'bg-purple-900/40 text-purple-300 border-purple-700/50'
                }`}>
                  {selectedStation.type}
                </span>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                  selectedStation.qualityFlag === 'GOOD' ? 'bg-green-900/40 text-green-400 border-green-700/50' : 
                  selectedStation.qualityFlag === 'SUSPECT' ? 'bg-amber-900/40 text-amber-400 border-amber-700/50' :
                  'bg-slate-800/80 text-slate-400 border-slate-700'
                }`}>
                  {selectedStation.qualityFlag}
                </span>
                <span className="px-2 py-1 text-[10px] bg-slate-800/80 text-slate-400 border border-slate-700 rounded ml-auto">
                  Demo observation data
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-[#030b14] p-3 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Latitude</div>
                  <div className="font-mono text-sm text-slate-200">{selectedStation.latitude.toFixed(3)}° N</div>
                </div>
                <div className="bg-[#030b14] p-3 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Longitude</div>
                  <div className="font-mono text-sm text-slate-200">{selectedStation.longitude.toFixed(3)}° E</div>
                </div>
              </div>

              <div className="bg-[#030b14] p-3 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Last Observation</div>
                <div className="font-mono text-sm text-slate-200">
                  {new Date(selectedStation.timestamp).toLocaleString(undefined, { 
                    dateStyle: 'medium', 
                    timeStyle: 'short',
                    timeZone: 'UTC' 
                  })} UTC
                </div>
              </div>

              <div className="space-y-3 mt-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">Measurements</h4>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Depth</span>
                  <span className="text-sm font-medium text-white">{selectedStation.depthM.toFixed(1)} m</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Temperature</span>
                  <span className="text-sm font-medium text-white">{selectedStation.latestObservation.temperatureC.toFixed(2)} °C</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Salinity</span>
                  <span className="text-sm font-medium text-white">{selectedStation.latestObservation.salinityPsu.toFixed(2)} PSU</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Current Speed</span>
                  <span className="text-sm font-medium text-white">{selectedStation.latestObservation.currentSpeedMs.toFixed(2)} m/s</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Platform Description</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedStation.platformDescription}
                </p>
              </div>
            </div>
          )}
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
