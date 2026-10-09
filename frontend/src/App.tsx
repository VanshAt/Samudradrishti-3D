import { useRef, useState, useEffect, useMemo } from 'react';
import { Waves, Settings, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';
import OceanViewer from './components/OceanViewer';
import type { OceanViewerRef } from './components/OceanViewer';
import { demoStations } from './data/demoStations';
import type { DepthLevel, OceanVariable, ObservationStation } from './types/ocean';
import TemperatureLegend from './components/TemperatureLegend';
import SalinityLegend from './components/SalinityLegend';
import CurrentLegend from './components/CurrentLegend';
import OceanConditionInsightPanel from './components/OceanConditionInsightPanel';
import { getTemperatureLayer } from './data/demoTemperature';
import { getSalinityLayer } from './data/demoSalinity';
import { getCurrentLayer } from './data/demoCurrents';
import { getTimedStations } from './data/demoStationSnapshots';
import { DEMO_TIME_STEPS, formatDemoTime } from './data/demoTime';
import type { TimeIndex } from './types/ocean';
import { TimelineControl } from './components/TimelineControl';
import InspectorTabs, { type InspectorTab } from './components/InspectorTabs';
import ModelComparisonPanel from './components/ModelComparisonPanel';
import { getStationModelComparison } from './data/demoModelProfiles';
import { AlertCenter } from './components/AlertCenter';
import { AlertDetailPanel } from './components/AlertDetailPanel';
import { DemoScenarioPanel } from './components/DemoScenarioPanel';
import { generateAlertsForTime, filterAlerts } from './utils/alertEngine';
import type { AlertFilters, OceanAlert, DemoScenario } from './types/alerts';
import { DataSourceSelector } from './components/DataSourceSelector';
import { SourceStatusBadge } from './components/SourceStatusBadge';
import { AboutDataPanel } from './components/AboutDataPanel';
import { StationDetailCard } from './components/StationDetailCard';
import { oceanApi } from './services/oceanApi';
import type { DataSourceId, SourceStatus, ApiLayerResponse, ApiObservationStation } from './types/api';

function App() {
  const viewerRef = useRef<OceanViewerRef>(null);

  const [showArgo, setShowArgo] = useState(true);
  const [showBuoys, setShowBuoys] = useState(true);
  const [showGliders, setShowGliders] = useState(true);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const [activeVariable, setActiveVariable] = useState<OceanVariable | null>(null);
  const [selectedDepth, setSelectedDepth] = useState<DepthLevel>(0);
  const [modelLayerOpacity, setModelLayerOpacity] = useState(0.65);

  const [activeTimeIndex, setActiveTimeIndex] = useState<TimeIndex>(0);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);

  const [activeInspectorTab, setActiveInspectorTab] = useState<InspectorTab>("overview");

  const [alertFilters, setAlertFilters] = useState<AlertFilters>({
    severities: [],
    types: []
  });
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [focusAlertFn, setFocusAlertFn] = useState<((alert: OceanAlert) => void) | null>(null);

  const [selectedDataSource, setSelectedDataSource] = useState<DataSourceId>("local_demo");
  const [sourceStatuses, setSourceStatuses] = useState<SourceStatus[]>([]);
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [layerOverride, setLayerOverride] = useState<ApiLayerResponse | null>(null);
  const [stationsOverride, setStationsOverride] = useState<ApiObservationStation[] | null>(null);

  const layerCache = useRef<Map<string, ApiLayerResponse>>(new Map());
  const stationCache = useRef<Map<string, ApiObservationStation[]>>(new Map());

  // 1. Fetch sources logic
  const fetchSources = async () => {
    try {
      const statuses = await oceanApi.getSources();
      setSourceStatuses(statuses);
    } catch (e) {
      console.warn("Backend API unavailable, Local Demo only.", e);
      setSourceStatuses([
        { id: "local_demo", label: "Local Demo", available: true, isDemo: true, description: "Offline-safe Local Demo available." } as SourceStatus,
        { id: "backend_demo", label: "Backend Demo API", available: false, isDemo: true, description: "Backend Demo API is currently unreachable." } as SourceStatus,
        { id: "archived_dataset", label: "Archived Dataset", available: false, isDemo: false, description: "Backend is unreachable." } as SourceStatus
      ]);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleSelectSource = (sourceId: DataSourceId) => {
    if (sourceId === 'local_demo') {
      setSourceError(null);
    }
    fetchSources();
    setSelectedDataSource(sourceId);
  };

  // 3. Fetch logic for layer & stations
  useEffect(() => {
    if (selectedDataSource === "local_demo") {
      setLayerOverride(null);
      setStationsOverride(null);
      setIsSourceLoading(false);
      // Note: We do not clear sourceError here, so that if a backend failure triggered
      // a fallback to local_demo, the error message remains visible to the user.
      return;
    }

    const abortController = new AbortController();

    const fetchData = async () => {
      setIsSourceLoading(true);
      setSourceError(null);
      try {
        const sKey = `${selectedDataSource}:${activeTimeIndex}`;
        let st = stationCache.current.get(sKey);
        if (!st) {
          st = await oceanApi.getStations({ source: selectedDataSource, timeIndex: activeTimeIndex }, abortController.signal);
          stationCache.current.set(sKey, st);
        }
        setStationsOverride(st);

        if (activeVariable) {
           const lKey = `${selectedDataSource}:${activeVariable}:${selectedDepth}:${activeTimeIndex}`;
           let lyr = layerCache.current.get(lKey);
           if (!lyr) {
             lyr = await oceanApi.getLayer({
               source: selectedDataSource,
               variable: activeVariable,
               depthM: selectedDepth,
               timeIndex: activeTimeIndex
             }, abortController.signal);
             layerCache.current.set(lKey, lyr);
           }
           setLayerOverride(lyr);
        } else {
           setLayerOverride(null);
        }

      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setSourceError(err instanceof Error ? err.message : "Failed to fetch from backend");
        // Do NOT change selectedDataSource here; let the user manually switch or retry.
      } finally {
        setIsSourceLoading(false);
      }
    };

    fetchData();

    return () => abortController.abort();
  }, [selectedDataSource, activeVariable, selectedDepth, activeTimeIndex]);

  useEffect(() => {
    setSelectedStationId(null);
    setSelectedAlertId(null);
  }, [selectedDataSource]);
  const activeTimeIso = useMemo(() => DEMO_TIME_STEPS[activeTimeIndex], [activeTimeIndex]);
  const timedStations = useMemo(() => {
    if (stationsOverride) {
      return stationsOverride.map((st) => ({
        ...st,
        route: st.route ?? undefined
      })) as ObservationStation[];
    }
    return getTimedStations(demoStations, activeTimeIndex);
  }, [activeTimeIndex, stationsOverride]);

  const selectedTimedStation = useMemo(() => {
    if (!selectedStationId) return null;
    return timedStations.find((s) => s.id === selectedStationId) || null;
  }, [selectedStationId, timedStations]);

  const selectedComparison = useMemo(() => {
    if (!selectedStationId) return null;

    let baseStation: ObservationStation | undefined;
    if (stationsOverride) {
      const apiStation = stationsOverride.find((s) => s.id === selectedStationId);
      if (apiStation) {
        baseStation = { ...apiStation, route: apiStation.route ?? undefined } as ObservationStation;
      }
    }

    if (!baseStation) {
      baseStation = demoStations.find(s => s.id === selectedStationId);
    }

    if (!baseStation) return null;
    return getStationModelComparison(baseStation, activeTimeIndex);
  }, [selectedStationId, activeTimeIndex, stationsOverride]);

  const allAlerts = useMemo(() => generateAlertsForTime(activeTimeIndex), [activeTimeIndex]);
  const filteredAlerts = useMemo(() => filterAlerts(allAlerts, alertFilters), [allAlerts, alertFilters]);

  const selectedAlert = useMemo(() => allAlerts.find(a => a.id === selectedAlertId) ?? null, [allAlerts, selectedAlertId]);

  useEffect(() => {
    if (selectedAlertId && !selectedAlert) {
      setSelectedAlertId(null);
    }
  }, [selectedAlert, selectedAlertId]);

  const handleSelectAlert = (alert: OceanAlert) => {
    setSelectedAlertId(alert.id);
    if (alert.stationId) {
      const station = demoStations.find(s => s.id === alert.stationId);
      if (station) {
        const isHidden = (station.type === "argo" && !showArgo) ||
                         (station.type === "buoy" && !showBuoys) ||
                         (station.type === "glider" && !showGliders);
        if (!isHidden) {
          setSelectedStationId(alert.stationId);
        }
      }
    }
  };

  const handleMapSelectAlert = (alertId: string | null) => {
    if (!alertId) {
      setSelectedAlertId(null);
      return;
    }
    const alert = allAlerts.find(a => a.id === alertId);
    if (alert) {
      handleSelectAlert(alert);
    }
  };

  const demoScenario = useMemo((): DemoScenario | null => {
    const t0Alerts = generateAlertsForTime(0);
    const target = t0Alerts.find(a => a.severity === "high" && a.type === "wave" && a.stationId?.startsWith("buoy"))
      || t0Alerts.find(a => a.severity === "high")
      || t0Alerts[0];

    if (!target) return null;
    return {
      id: "marine-safety-bay-of-bengal",
      title: "Bay of Bengal Marine Safety Review",
      description: "This simulated Bay of Bengal review highlights a station with elevated demo wave/current conditions and/or model-observation mismatch. The view combines vector-field context, observation readings, and transparent threshold logic for demonstration.",
      targetAlertId: target.id,
      timeIndex: 0,
      cameraLongitude: target.longitude,
      cameraLatitude: target.latitude,
      cameraHeight: 400000,
      recommendedDemoAction: target.recommendedAction,
      isDemo: true
    };
  }, []);

  const launchScenario = () => {
    if (!demoScenario) return;
    setIsTimelinePlaying(false);
    setActiveTimeIndex(demoScenario.timeIndex);
    setActiveVariable("currents");
    setSelectedDepth(0);
    setModelLayerOpacity(0.75);
    setShowBuoys(true);
    setSelectedAlertId(demoScenario.targetAlertId);
    const t0Alerts = generateAlertsForTime(demoScenario.timeIndex);
    const target = t0Alerts.find(a => a.id === demoScenario.targetAlertId);
    if (target && target.stationId) {
      setSelectedStationId(target.stationId);
    }
    setIsScenarioOpen(true);
    setTimeout(() => {
      if (target && focusAlertFn) {
        focusAlertFn(target);
      }
    }, 100);
  };

  useEffect(() => {
    setActiveInspectorTab("overview");
  }, [selectedStationId]);

  useEffect(() => {
    (window as any).selectStation = (id: string) => {
      setSelectedStationId(id);
    };
  }, []);

  useEffect(() => {
    if (!selectedStationId) {
      return;
    }
    const station = demoStations.find(s => s.id === selectedStationId);
    if (!station) return;

    const selectedTypeIsHidden =
      (station.type === "argo" && !showArgo) ||
      (station.type === "buoy" && !showBuoys) ||
      (station.type === "glider" && !showGliders);

    if (selectedTypeIsHidden) {
      setSelectedStationId(null);
    }
  }, [selectedStationId, showArgo, showBuoys, showGliders]);

  useEffect(() => {
    if (!isTimelinePlaying) return;

    let intervalMs = 1400;
    if (playbackSpeed === 0.5) intervalMs = 2800;
    if (playbackSpeed === 2) intervalMs = 700;

    const timer = setInterval(() => {
      setActiveTimeIndex(prev => {
        const next = prev + 1;
        return next > 7 ? 0 : next as TimeIndex;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isTimelinePlaying, playbackSpeed]);

  const handleResetView = () => {
    if (viewerRef.current) {
      viewerRef.current.resetView();
    }
  };

  const argoCount = demoStations.filter(s => s.type === 'argo').length;
  const buoyCount = demoStations.filter(s => s.type === 'buoy').length;
  const gliderCount = demoStations.filter(s => s.type === 'glider').length;

  const currentTempLayer = (layerOverride && layerOverride.variable === "temperature") ? layerOverride : getTemperatureLayer(selectedDepth, activeTimeIndex);
  const currentSalLayer = (layerOverride && layerOverride.variable === "salinity") ? layerOverride : getSalinityLayer(selectedDepth, activeTimeIndex);
  const currentCurLayer = (layerOverride && layerOverride.variable === "currents") ? layerOverride : getCurrentLayer(selectedDepth, activeTimeIndex);
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
          <button
            onClick={launchScenario}
            disabled={!demoScenario}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 rounded border border-blue-400 transition-colors disabled:opacity-50 text-white"
          >
            <ShieldAlert size={16} />
            Demo Scenario
          </button>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-ocean-dark/50 rounded-full border border-ocean-accent/30">
            <span className="w-2 h-2 rounded-full bg-ocean-accent animate-pulse"></span>
            <span className="text-xs font-medium text-ocean-accent">
              {!activeVariable
                ? "Demo Dataset • Bay of Bengal"
                : activeVariable === "temperature"
                ? `Bay of Bengal • Temperature at ${selectedDepth} m`
                : activeVariable === "salinity"
                ? `Bay of Bengal • Salinity at ${selectedDepth} m`
                : `Bay of Bengal • Currents at ${selectedDepth} m`}
            </span>
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
        <aside className="w-64 bg-ocean-panel border-r border-cyan-900/50 flex flex-col shrink-0 overflow-y-auto p-4 gap-4">

          <DataSourceSelector
            sources={sourceStatuses}
            selectedSource={selectedDataSource}
            isLoading={isSourceLoading}
            onSelectSource={handleSelectSource}
          />
          
          <AboutDataPanel selectedDataSource={selectedDataSource} />

          <div className="border-t border-cyan-900/50 -mx-4"></div>

          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Settings size={16} className="text-ocean-accent" />
              Layer Controls
            </h2>
          </div>

          <div className="p-4 flex flex-col gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Ocean Fields</h3>
              <p className="text-[10px] text-slate-500 mb-3">Display one demo numerical-model field at a time.</p>

              <div className="flex flex-col gap-2">
                {[
                  { id: 'temperature', label: 'Temperature', unit: '°C', color: 'bg-red-500' },
                  { id: 'salinity', label: 'Salinity', unit: 'PSU', color: 'bg-blue-500' },
                  { id: 'currents', label: 'Currents', unit: 'm/s', color: 'bg-green-500' }
                ].map(v => {
                  const isActive = activeVariable === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setActiveVariable(isActive ? null : v.id as OceanVariable)}
                      aria-pressed={isActive}
                      className={`flex items-center justify-between p-2 rounded border text-left transition-colors ${
                        isActive
                          ? 'bg-ocean-accent/10 border-ocean-accent text-white'
                          : 'bg-ocean-dark/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${v.color}`}></span>
                        <span className="text-sm">{v.label}</span>
                      </div>
                      <span className="text-xs font-mono">{v.unit}</span>
                    </button>
                  );
                })}
              </div>

              {/* Depth Slice Control */}
              <div className={`mt-3 ${activeVariable !== null ? 'opacity-100' : 'opacity-40 pointer-events-none'} transition-opacity`}>
                <div className="text-xs text-slate-400 mb-2">Depth Slice</div>
                <div className="grid grid-cols-2 gap-1 bg-ocean-dark p-1 rounded">
                  {([0, 50, 100, 200] as DepthLevel[]).map(depth => (
                    <button
                      key={depth}
                      onClick={() => setSelectedDepth(depth)}
                      aria-pressed={selectedDepth === depth}
                      className={`py-1 text-xs rounded transition-colors ${
                        selectedDepth === depth
                          ? 'bg-ocean-accent text-ocean-dark font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {depth === 0 ? "Surface" : `${depth} m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity Control */}
              <div className={`mt-3 ${activeVariable !== null ? 'opacity-100' : 'opacity-40 pointer-events-none'} transition-opacity`}>
                <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
                  <span>Model Layer Opacity</span>
                  <span>{Math.round(modelLayerOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.9"
                  step="0.05"
                  value={modelLayerOpacity}
                  onChange={(e) => setModelLayerOpacity(parseFloat(e.target.value))}
                  aria-label="Model Layer Opacity"
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-ocean-accent"
                />
              </div>

              <div className="mt-3 text-[10px] text-slate-500 text-center italic border-t border-slate-700/50 pt-2">
                Demo numerical model data • not a live operational feed.
              </div>
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

            <AlertCenter
              alerts={filteredAlerts}
              filters={alertFilters}
              selectedAlertId={selectedAlertId}
              onFiltersChange={setAlertFilters}
              onSelectAlert={handleSelectAlert}
              onClearSelection={() => setSelectedAlertId(null)}
            />
          </div>
        </aside>

        {/* 3. Main 3D Viewer Area */}
        <main className="flex-1 relative bg-[#030b14] flex flex-col items-center justify-center">
          <button id="hack-select" onClick={() => (window as any).selectStation('buoy-1')} className="w-1 h-1 opacity-0 absolute z-50 left-0 top-0"></button>
          <OceanViewer
            ref={viewerRef}
            showArgo={showArgo}
            showBuoys={showBuoys}
            showGliders={showGliders}
            stations={timedStations}
            selectedStationId={selectedStationId}
            onSelectStation={setSelectedStationId}
            activeVariable={activeVariable}
            selectedDepth={selectedDepth}
            modelLayerOpacity={modelLayerOpacity}
            activeTimeIndex={activeTimeIndex}
            activeTimeIso={activeTimeIso}
            alerts={filteredAlerts}
            selectedAlertId={selectedAlertId}
            onSelectAlert={handleMapSelectAlert}
            onFocusAlertReady={(focus) => setFocusAlertFn(() => focus)}
            layerOverride={layerOverride}
          />

          <TemperatureLegend
            showTemperature={activeVariable === "temperature"}
            selectedDepth={selectedDepth}
            minValue={currentTempLayer.minValue}
            maxValue={currentTempLayer.maxValue}
            timeIso={activeTimeIso}
            timeIndex={activeTimeIndex}
          />

          <SalinityLegend
            activeVariable={activeVariable}
            selectedDepth={selectedDepth}
            minValue={currentSalLayer.minValue}
            maxValue={currentSalLayer.maxValue}
            timeIso={activeTimeIso}
            timeIndex={activeTimeIndex}
          />

          <CurrentLegend
            activeVariable={activeVariable}
            selectedDepth={selectedDepth}
            minValue={currentCurLayer.minValue}
            maxValue={currentCurLayer.maxValue}
            timeIso={activeTimeIso}
            timeIndex={activeTimeIndex}
          />

          {/* Depth Indicator Overlay */}
          <div className="absolute top-4 left-4 bg-ocean-panel/90 border border-cyan-900/50 px-3 py-2 rounded shadow-lg backdrop-blur-md z-10">
            <div className="text-xs text-slate-400">Current Depth</div>
            {activeVariable === null ? (
              <div className="text-sm font-bold text-slate-400 mt-1">No model layer selected</div>
            ) : (
              <>
                <div className="text-lg font-bold text-ocean-accent">
                  {selectedDepth} m <span className="text-xs font-normal text-slate-300">{selectedDepth === 0 ? '(Surface)' : ''}</span>
                </div>
                <div className="text-[10px] text-slate-300 mt-1">
                  {activeVariable === 'temperature' ? 'Temperature slice' : activeVariable === 'salinity' ? 'Salinity slice' : 'Current vector field'}
                </div>
              </>
            )}
          </div>

          {/* Station Detail Card Overlay */}
          {selectedTimedStation && (
            <div className="absolute top-24 left-4 z-20 pointer-events-none">
              <StationDetailCard
                station={selectedTimedStation}
                selectedDepth={selectedDepth}
                alerts={allAlerts}
                onClose={() => setSelectedStationId(null)}
              />
            </div>
          )}

          {/* Viewer Overlay */}
          <div className="pointer-events-none absolute top-4 right-4 z-10 flex flex-col items-end gap-1 text-right">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">3D Ocean Viewer</h2>
            <div className="text-sm text-slate-300 drop-shadow">
              {!activeVariable
                ? "Bay of Bengal • Demo Mode"
                : activeVariable === "temperature"
                ? `Bay of Bengal • Temperature at ${selectedDepth} m`
                : activeVariable === "salinity"
                ? `Bay of Bengal • Salinity at ${selectedDepth} m`
                : `Bay of Bengal • Currents at ${selectedDepth} m`}
            </div>
            <div className="mt-1 rounded bg-ocean-dark/80 px-2 py-1 text-xs font-mono text-ocean-accent border border-ocean-accent/30 backdrop-blur-sm shadow">
              {formatDemoTime(activeTimeIso)}
            </div>

            <div className="mt-2">
              <SourceStatusBadge
                selectedSourceId={selectedDataSource}
                sources={sourceStatuses}
                error={sourceError}
              />
            </div>
          </div>

          <DemoScenarioPanel
            isOpen={isScenarioOpen}
            scenario={demoScenario}
            activeTimeIndex={activeTimeIndex}
            onLaunch={() => {}}
            onClose={() => setIsScenarioOpen(false)}
          />
        </main>

        {/* 5. Right Information Panel */}
        <aside className="w-80 bg-ocean-panel border-l border-cyan-900/50 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-cyan-900/50">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Info size={16} className="text-ocean-accent" />
              Station Inspector
            </h2>
          </div>

          {selectedAlert && (
            <div className="px-4 pt-4 border-b border-cyan-900/50 bg-[#030b14]">
              <AlertDetailPanel
                alert={selectedAlert}
                onFocusAlert={() => focusAlertFn && focusAlertFn(selectedAlert)}
                onClear={() => setSelectedAlertId(null)}
              />
            </div>
          )}

          <InspectorTabs
            activeTab={activeInspectorTab}
            onTabChange={setActiveInspectorTab}
            comparisonLevel={selectedComparison?.agreementLevel}
            disabled={!selectedTimedStation}
          />

          {!selectedTimedStation ? (
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
          ) : activeInspectorTab === 'comparison' && selectedComparison ? (
            <div className="flex-1 p-5 overflow-y-auto">
              <ModelComparisonPanel
                station={selectedTimedStation}
                comparison={selectedComparison}
                selectedDepth={selectedDepth}
              />
            </div>
          ) : (
            <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedTimedStation.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedTimedStation.id}</p>
                </div>
                <button
                  onClick={() => setSelectedStationId(null)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  aria-label="Clear selection"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                  selectedTimedStation.type === 'argo' ? 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50' :
                  selectedTimedStation.type === 'buoy' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' :
                  'bg-purple-900/40 text-purple-300 border-purple-700/50'
                }`}>
                  {selectedTimedStation.type}
                </span>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                  selectedTimedStation.qualityFlag === 'GOOD' ? 'bg-green-900/40 text-green-400 border-green-700/50' :
                  selectedTimedStation.qualityFlag === 'SUSPECT' ? 'bg-amber-900/40 text-amber-400 border-amber-700/50' :
                  'bg-slate-800/80 text-slate-400 border-slate-700'
                }`}>
                  {selectedTimedStation.qualityFlag}
                </span>
                <span className="px-2 py-1 text-[10px] bg-blue-900/40 text-blue-300 border border-blue-700/50 rounded ml-auto">
                  Demo time series
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-[#030b14] p-3 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Latitude</div>
                  <div className="font-mono text-sm text-slate-200">{selectedTimedStation.latitude.toFixed(3)}° N</div>
                </div>
                <div className="bg-[#030b14] p-3 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Longitude</div>
                  <div className="font-mono text-sm text-slate-200">{selectedTimedStation.longitude.toFixed(3)}° E</div>
                </div>
              </div>

              <div className="bg-[#030b14] p-3 rounded border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Last Observation</div>
                  <span className="text-[9px] text-slate-500">Demo time series</span>
                </div>
                <div className="font-mono text-sm text-slate-200">
                  {formatDemoTime(selectedTimedStation.timestamp)}
                </div>
              </div>

              <div className="space-y-3 mt-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">Measurements</h4>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Depth</span>
                  <span className="text-sm font-medium text-white">{selectedTimedStation.depthM.toFixed(1)} m</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Temperature</span>
                  <span className="text-sm font-medium text-white">{selectedTimedStation.latestObservation.temperatureC.toFixed(2)} °C</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Salinity</span>
                  <span className="text-sm font-medium text-white">{selectedTimedStation.latestObservation.salinityPsu.toFixed(2)} PSU</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Current Speed</span>
                  <span className="text-sm font-medium text-white">{selectedTimedStation.latestObservation.currentSpeedMs.toFixed(2)} m/s</span>
                </div>
              </div>

              <OceanConditionInsightPanel
                station={selectedTimedStation}
                activeVariable={activeVariable}
                selectedDepth={selectedDepth}
              />

              <div className="mt-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Platform Description</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedTimedStation.platformDescription}
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <footer className="shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] relative">
        <TimelineControl
          activeTimeIndex={activeTimeIndex}
          isPlaying={isTimelinePlaying}
          playbackSpeed={playbackSpeed}
          onPrevious={() => setActiveTimeIndex(prev => prev === 0 ? 7 : (prev - 1) as TimeIndex)}
          onNext={() => setActiveTimeIndex(prev => prev === 7 ? 0 : (prev + 1) as TimeIndex)}
          onTogglePlay={() => setIsTimelinePlaying(!isTimelinePlaying)}
          onTimeIndexChange={(idx) => setActiveTimeIndex(idx)}
          onPlaybackSpeedChange={(speed) => setPlaybackSpeed(speed)}
        />
      </footer>
    </div>
  );
}

export default App;
