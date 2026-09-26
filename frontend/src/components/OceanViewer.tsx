import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as Cesium from "cesium";
import { demoStations } from "../data/demoStations";
import type { ObservationStation } from "../types/ocean";

export interface OceanViewerProps {
  showArgo: boolean;
  showBuoys: boolean;
  showGliders: boolean;
  selectedStation: ObservationStation | null;
  onSelectStation: (station: ObservationStation | null) => void;
}

export interface OceanViewerRef {
  resetView: () => void;
}

const BAY_OF_BENGAL_DESTINATION = Cesium.Cartesian3.fromDegrees(
  89.0,
  15.0,
  1_600_000
);

const flyToBayOfBengal = (viewer: Cesium.Viewer): void => {
  viewer.camera.flyTo({
    destination: BAY_OF_BENGAL_DESTINATION,
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-55),
      roll: 0,
    },
    duration: 1.5,
  });
};

const OceanViewer = forwardRef<OceanViewerRef, OceanViewerProps>((props, ref) => {
  const { showArgo, showBuoys, showGliders, selectedStation, onSelectStation } = props;
  
  const cesiumContainerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const dataSourceRef = useRef<Cesium.CustomDataSource | null>(null);
  
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    station: ObservationStation | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    station: null,
  });

  useImperativeHandle(ref, () => ({
    resetView: (): void => {
      if (viewerRef.current) {
        flyToBayOfBengal(viewerRef.current);
      }
    },
  }));

  // Initial Viewer Setup
  useEffect(() => {
    const container = cesiumContainerRef.current;

    if (!container || viewerRef.current) {
      return;
    }

    const token = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined;

    if (token?.trim()) {
      Cesium.Ion.defaultAccessToken = token;
    } else {
      console.warn(
        "Missing VITE_CESIUM_ION_TOKEN. Add it to frontend/.env and restart Vite."
      );
    }

    const viewer = new Cesium.Viewer(container, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      vrButton: false,
      baseLayer: false, 
    });

    viewerRef.current = viewer;
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#0A192F");

    const darkImageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      credit: new Cesium.Credit(
        "Map tiles by CARTO, under CC BY 3.0. Data by OpenStreetMap, under ODbL."
      ),
    });
    viewer.imageryLayers.addImageryProvider(darkImageryProvider);

    // Create a CustomDataSource for stations to group them cleanly
    const dataSource = new Cesium.CustomDataSource("oceanStations");
    viewer.dataSources.add(dataSource);
    dataSourceRef.current = dataSource;

    flyToBayOfBengal(viewer);

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
      dataSourceRef.current = null;
    };
  }, []);

  // Update Station Entities when filters or selection changes
  useEffect(() => {
    const viewer = viewerRef.current;
    const dataSource = dataSourceRef.current;

    if (!viewer || !dataSource) return;

    dataSource.entities.removeAll();

    const filteredStations = demoStations.filter(station => {
      if (station.type === 'argo' && showArgo) return true;
      if (station.type === 'buoy' && showBuoys) return true;
      if (station.type === 'glider' && showGliders) return true;
      return false;
    });

    filteredStations.forEach(station => {
      const isSelected = selectedStation?.id === station.id;
      
      let color: Cesium.Color;
      let outlineColor = isSelected ? Cesium.Color.WHITE : Cesium.Color.BLACK;
      let outlineWidth = isSelected ? 3 : 1;
      let pixelSize = 14;

      if (station.type === 'argo') {
        color = Cesium.Color.fromCssColorString("#00D4D8"); // Cyan
        pixelSize = isSelected ? 20 : 14;
      } else if (station.type === 'buoy') {
        color = Cesium.Color.fromCssColorString("#FACC15"); // Yellow
        pixelSize = isSelected ? 24 : 16;
      } else {
        color = Cesium.Color.fromCssColorString("#C084FC"); // Purple
        pixelSize = isSelected ? 24 : 16;
      }

      // Add main marker
      const entity = new Cesium.Entity({
        id: station.id,
        position: Cesium.Cartesian3.fromDegrees(station.longitude, station.latitude),
        point: {
          pixelSize,
          color,
          outlineColor,
          outlineWidth,
          disableDepthTestDistance: Number.POSITIVE_INFINITY, // Show above terrain/globe
        },
        properties: new Cesium.PropertyBag({ stationId: station.id }),
      });
      dataSource.entities.add(entity);

      // If glider, optionally add route
      if (station.type === 'glider' && station.route) {
        const positions = station.route.map(pt => Cesium.Cartesian3.fromDegrees(pt.longitude, pt.latitude));
        dataSource.entities.add({
          id: `${station.id}-route`,
          polyline: {
            positions,
            width: isSelected ? 3 : 2,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString("#C084FC").withAlpha(0.6),
              dashLength: 16.0,
            }),
          }
        });
      }

      // Add optional pulse ring for selected station
      if (isSelected) {
        dataSource.entities.add({
          id: `${station.id}-pulse`,
          position: Cesium.Cartesian3.fromDegrees(station.longitude, station.latitude),
          ellipse: {
            semiMinorAxis: 15000.0,
            semiMajorAxis: 15000.0,
            material: color.withAlpha(0.3),
            outline: true,
            outlineColor: color,
            outlineWidth: 2,
          }
        });
      }
    });
  }, [showArgo, showBuoys, showGliders, selectedStation]);

  // Handle Interactions (Hover & Click)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // Hover (Tooltip)
    handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      const pickedObject = viewer.scene.pick(movement.endPosition);
      
      if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.properties) {
        const stationId = pickedObject.id.properties.getValue(viewer.clock.currentTime)?.stationId;
        if (stationId) {
          (viewer.container as HTMLElement).style.cursor = "pointer";
          const hoveredStation = demoStations.find(s => s.id === stationId);
          if (hoveredStation) {
            setTooltipState({
              visible: true,
              x: movement.endPosition.x,
              y: movement.endPosition.y,
              station: hoveredStation,
            });
          }
          return;
        }
      }
      
      (viewer.container as HTMLElement).style.cursor = "default";
      setTooltipState(prev => prev.visible ? { ...prev, visible: false } : prev);

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // Click (Select)
    handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedObject = viewer.scene.pick(movement.position);
      
      if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.properties) {
        const stationId = pickedObject.id.properties.getValue(viewer.clock.currentTime)?.stationId;
        if (stationId) {
          const clickedStation = demoStations.find(s => s.id === stationId) || null;
          onSelectStation(clickedStation);
          return;
        }
      }
      
      // Clicked on empty ocean or unclickable entity
      onSelectStation(null);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [onSelectStation]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={cesiumContainerRef}
        className="absolute inset-0 h-full w-full"
      />

      {/* Title Overlay */}
      <div className="pointer-events-none absolute left-5 top-5 z-10">
        <div className="rounded-xl border border-cyan-300/25 bg-[#061522]/80 px-4 py-3 shadow-lg backdrop-blur-md">
          <h2 className="text-lg font-bold tracking-wide text-[#E6FBFF]">
            3D Ocean Viewer
          </h2>

          <div className="mt-1 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D4D8]" />
            <p className="text-sm font-medium text-[#8EB7C2]">
              Bay of Bengal • Demo Mode
            </p>
          </div>
        </div>
      </div>

      {/* Custom HTML Tooltip */}
      {tooltipState.visible && tooltipState.station && (
        <div 
          className="pointer-events-none absolute z-50 bg-[#0B2638]/95 border border-[#00D4D8]/30 rounded p-2 text-slate-200 shadow-xl backdrop-blur-sm transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ 
            left: tooltipState.x, 
            top: tooltipState.y - 15,
            minWidth: '150px' 
          }}
        >
          <div className="text-sm font-bold text-white border-b border-slate-700 pb-1 mb-1">
            {tooltipState.station.name}
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
            {tooltipState.station.type}
          </div>
          <div className="text-xs grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="text-slate-400">Temp:</span>
            <span className="font-mono text-white text-right">{tooltipState.station.latestObservation.temperatureC.toFixed(1)}°C</span>
            <span className="text-slate-400">Speed:</span>
            <span className="font-mono text-white text-right">{tooltipState.station.latestObservation.currentSpeedMs.toFixed(2)}m/s</span>
          </div>
        </div>
      )}
    </div>
  );
});

OceanViewer.displayName = "OceanViewer";

export default OceanViewer;
