import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as Cesium from "cesium";
import type { ObservationStation, DepthLevel, OceanVariable, TemperatureGridPoint, SalinityGridPoint, CurrentGridPoint } from "../types/ocean";
import { getTemperatureLayer } from "../data/demoTemperature";
import { getSalinityLayer } from "../data/demoSalinity";
import { getCurrentLayer } from "../data/demoCurrents";
import { getTemperatureColor, getSalinityColor, getCurrentSpeedColor } from "../utils/oceanColors";
import type { TimeIndex } from "../types/ocean";
import type { OceanAlert } from "../types/alerts";
import type { ApiLayerResponse } from "../types/api";
import { AlertLegend } from "./AlertLegend";

export interface OceanViewerProps {
  showArgo: boolean;
  showBuoys: boolean;
  showGliders: boolean;
  stations: ObservationStation[];
  selectedStationId: string | null;
  onSelectStation: (stationId: string | null) => void;
  activeVariable: OceanVariable | null;
  selectedDepth: DepthLevel;
  modelLayerOpacity: number;
  activeTimeIndex: TimeIndex;
  activeTimeIso: string;
  alerts: OceanAlert[];
  selectedAlertId: string | null;
  onSelectAlert?: (alertId: string | null) => void;
  onFocusAlertReady?: (focus: (alert: OceanAlert) => void) => void;
  layerOverride?: ApiLayerResponse | null;
}

export interface OceanViewerRef {
  resetView: () => void;
}

const BAY_OF_BENGAL_DESTINATION = Cesium.Cartesian3.fromDegrees(
  85.0,
  10.0,
  5_000_000
);

const flyToBayOfBengal = (viewer: Cesium.Viewer): void => {
  viewer.camera.flyTo({
    destination: BAY_OF_BENGAL_DESTINATION,
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-75),
      roll: 0,
    },
    duration: 1.5,
  });
};

function getCurrentArrowEnd(
  longitude: number,
  latitude: number,
  directionDegrees: number,
  speedMs: number
): { endLongitude: number; endLatitude: number } {
  // Arrow length scaling based on speed (between 0.2 and 0.65 degrees approx)
  const lengthDegrees = Math.max(0.2, Math.min(0.65, speedMs * 0.8));

  // Math.sin and Math.cos take radians
  // 0 degrees points North, 90 points East
  // Since standard Math angles start with 0 East and go counter-clockwise,
  // we do:
  // deltaLat (North/South) = cos(direction)
  // deltaLon (East/West) = sin(direction)

  const directionRadians = (directionDegrees * Math.PI) / 180;

  const deltaLatitude = lengthDegrees * Math.cos(directionRadians);
  const deltaLongitude = lengthDegrees * Math.sin(directionRadians);

  return {
    endLongitude: longitude + deltaLongitude,
    endLatitude: latitude + deltaLatitude,
  };
}

const OceanViewer = forwardRef<OceanViewerRef, OceanViewerProps>((props, ref) => {
  const {
    showArgo,
    showBuoys,
    showGliders,
    stations,
    selectedStationId,
    onSelectStation,
    activeVariable,
    selectedDepth,
    modelLayerOpacity,
    activeTimeIndex,
    alerts,
    selectedAlertId,
    onSelectAlert,
    onFocusAlertReady,
    layerOverride
  } = props;

  const cesiumContainerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const stationSourceRef = useRef<Cesium.CustomDataSource | null>(null);
  const tempSourceRef = useRef<Cesium.CustomDataSource | null>(null);
  const salinitySourceRef = useRef<Cesium.CustomDataSource | null>(null);
  const currentsSourceRef = useRef<Cesium.CustomDataSource | null>(null);
  const oceanAlertsDataSourceRef = useRef<Cesium.CustomDataSource | null>(null);

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

  useEffect(() => {
    if (onFocusAlertReady) {
      onFocusAlertReady((alert: OceanAlert) => {
        if (viewerRef.current) {
          viewerRef.current.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(alert.longitude, alert.latitude, 400000),
            duration: 1.5,
          });
        }
      });
    }
  }, [onFocusAlertReady]);

  // Initial Viewer Setup
  useEffect(() => {
    let viewer: Cesium.Viewer | null = null;
    let isMounted = true;

    const initCesium = async () => {
      const container = cesiumContainerRef.current;
      if (!container || viewerRef.current) return;

      const token = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined;

      let baseLayer: Cesium.ImageryLayer;
      let terrainProvider: Cesium.TerrainProvider | undefined = undefined;

      if (token?.trim()) {
        Cesium.Ion.defaultAccessToken = token.trim();
        try {
          const provider = await Cesium.createWorldImageryAsync({
            style: Cesium.IonWorldImageryStyle.AERIAL
          });
          baseLayer = new Cesium.ImageryLayer(provider);
          terrainProvider = await Cesium.createWorldTerrainAsync();
        } catch (e) {
          console.error("Failed to load Cesium Ion resources", e);
          const osmProvider = new Cesium.OpenStreetMapImageryProvider({
            url: "https://a.tile.openstreetmap.org/"
          });
          baseLayer = new Cesium.ImageryLayer(osmProvider);
        }
      } else {
        const osmProvider = new Cesium.OpenStreetMapImageryProvider({
          url: "https://a.tile.openstreetmap.org/"
        });
        baseLayer = new Cesium.ImageryLayer(osmProvider);
      }

      if (!isMounted) return;

      viewer = new Cesium.Viewer(container, {
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
        baseLayer: baseLayer,
        terrainProvider: terrainProvider,
      });

      viewerRef.current = viewer;
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#0A192F");

      // Create a CustomDataSource for temperature grid (render below stations)
      const tempSource = new Cesium.CustomDataSource("temperatureGrid");
      viewer.dataSources.add(tempSource);
      tempSourceRef.current = tempSource;

      const salinitySource = new Cesium.CustomDataSource("salinityGrid");
      viewer.dataSources.add(salinitySource);
      salinitySourceRef.current = salinitySource;

      const currentsSource = new Cesium.CustomDataSource("currentsGrid");
      viewer.dataSources.add(currentsSource);
      currentsSourceRef.current = currentsSource;

      // Create a CustomDataSource for stations to group them cleanly
      const stationSource = new Cesium.CustomDataSource("oceanStations");
      viewer.dataSources.add(stationSource);
      stationSourceRef.current = stationSource;

      const oceanAlertsDataSource = new Cesium.CustomDataSource("oceanAlerts");
      viewer.dataSources.add(oceanAlertsDataSource);
      oceanAlertsDataSourceRef.current = oceanAlertsDataSource;

      flyToBayOfBengal(viewer);
    };

    initCesium();

    return () => {
      isMounted = false;
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
      stationSourceRef.current = null;
      tempSourceRef.current = null;
      salinitySourceRef.current = null;
      currentsSourceRef.current = null;
      oceanAlertsDataSourceRef.current = null;
    };
  }, []);

  // Update Temperature Entities
  useEffect(() => {
    const tempSource = tempSourceRef.current;
    if (!tempSource) return;

    tempSource.entities.removeAll();

    if (activeVariable !== "temperature") return;

    const layerData = (layerOverride && layerOverride.variable === "temperature")
      ? layerOverride
      : getTemperatureLayer(selectedDepth, activeTimeIndex);
    const { minValue, maxValue } = layerData;
    const points = layerData.points as TemperatureGridPoint[];

    const latHalfStep = 1.0;
    const lonHalfStep = 1.0625;

    points.forEach((pt, index: number) => {
      const color = getTemperatureColor(pt.temperatureC, minValue, maxValue, modelLayerOpacity);

      tempSource.entities.add({
        id: `temp-${index}`,
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(
            pt.longitude - lonHalfStep,
            pt.latitude - latHalfStep,
            pt.longitude + lonHalfStep,
            pt.latitude + latHalfStep
          ),
          material: new Cesium.ColorMaterialProperty(color),
          outline: false,
          height: 0,
        }
      });
    });
  }, [activeVariable, selectedDepth, modelLayerOpacity, activeTimeIndex, layerOverride]);

  // Update Salinity Entities
  useEffect(() => {
    const salinitySource = salinitySourceRef.current;
    if (!salinitySource) return;

    salinitySource.entities.removeAll();

    if (activeVariable !== "salinity") return;

    const layerData = (layerOverride && layerOverride.variable === "salinity")
      ? layerOverride
      : getSalinityLayer(selectedDepth, activeTimeIndex);
    const { minValue, maxValue } = layerData;
    const points = layerData.points as SalinityGridPoint[];

    const latHalfStep = 1.0;
    const lonHalfStep = 1.0625;

    points.forEach((pt, index: number) => {
      const color = getSalinityColor(pt.salinityPsu, minValue, maxValue, modelLayerOpacity);

      salinitySource.entities.add({
        id: `salinity-${index}`,
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(
            pt.longitude - lonHalfStep,
            pt.latitude - latHalfStep,
            pt.longitude + lonHalfStep,
            pt.latitude + latHalfStep
          ),
          material: new Cesium.ColorMaterialProperty(color),
          outline: false,
          height: 0,
        }
      });
    });
  }, [activeVariable, selectedDepth, modelLayerOpacity, activeTimeIndex, layerOverride]);

  // Update Current Entities
  useEffect(() => {
    const currentsSource = currentsSourceRef.current;
    if (!currentsSource) return;

    currentsSource.entities.removeAll();

    if (activeVariable !== "currents") return;

    const layerData = (layerOverride && layerOverride.variable === "currents")
      ? layerOverride
      : getCurrentLayer(selectedDepth, activeTimeIndex);
    const { minValue, maxValue } = layerData;
    const points = layerData.points as CurrentGridPoint[];

    points.forEach((pt, index: number) => {
      const color = getCurrentSpeedColor(pt.speedMs, minValue, maxValue, modelLayerOpacity);
      const { endLongitude, endLatitude } = getCurrentArrowEnd(pt.longitude, pt.latitude, pt.directionDegrees, pt.speedMs);

      currentsSource.entities.add({
        id: `current-${index}`,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            pt.longitude, pt.latitude,
            endLongitude, endLatitude
          ]),
          width: 4,
          material: new Cesium.PolylineArrowMaterialProperty(color),
        },
        // Optional small dot at the tail for clarity
        point: {
          pixelSize: 4,
          color: color,
        }
      });
    });
  }, [activeVariable, selectedDepth, modelLayerOpacity, activeTimeIndex, layerOverride]);

  // Update Station Entities when filters or selection changes
  useEffect(() => {
    const viewer = viewerRef.current;
    const dataSource = stationSourceRef.current;

    if (!viewer || !dataSource) return;

    dataSource.entities.removeAll();

    const filteredStations = stations.filter(station => {
      if (station.type === 'argo' && showArgo) return true;
      if (station.type === 'buoy' && showBuoys) return true;
      if (station.type === 'glider' && showGliders) return true;
      return false;
    });

    filteredStations.forEach(station => {
      const isSelected = selectedStationId === station.id;

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
          disableDepthTestDistance: Number.POSITIVE_INFINITY, // Show above terrain/globe and temp grid
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
            height: 10, // slightly above the surface/temp grid to avoid z-fighting
          }
        });
      }
    });
  }, [showArgo, showBuoys, showGliders, selectedStationId, stations]);

  // Update Alerts Entities
  useEffect(() => {
    const dataSource = oceanAlertsDataSourceRef.current;
    if (!dataSource) return;

    dataSource.entities.removeAll();

    alerts.forEach((alert) => {
      const isSelected = selectedAlertId === alert.id;
      let color: Cesium.Color;
      let radius: number;
      if (alert.severity === "high") {
        color = Cesium.Color.fromCssColorString("#EF4444"); // red
        radius = isSelected ? 30000 : 25000;
      } else if (alert.severity === "medium") {
        color = Cesium.Color.fromCssColorString("#F59E0B"); // amber
        radius = isSelected ? 23000 : 18000;
      } else {
        color = Cesium.Color.fromCssColorString("#38BDF8"); // light blue
        radius = isSelected ? 17000 : 12000;
      }

      const entity = new Cesium.Entity({
        id: alert.id,
        position: Cesium.Cartesian3.fromDegrees(alert.longitude, alert.latitude),
        ellipse: {
          semiMinorAxis: radius,
          semiMajorAxis: radius,
          material: color.withAlpha(isSelected ? 0.3 : 0.1),
          outline: true,
          outlineColor: isSelected ? Cesium.Color.WHITE : color,
          outlineWidth: isSelected ? 4 : 2,
          height: 20, // above station pulses
        },
        properties: new Cesium.PropertyBag({ alertId: alert.id }),
      });

      if (alert.severity === "high" || alert.severity === "medium") {
        entity.label = {
          text: `${alert.severity.toUpperCase()} • ${alert.type.toUpperCase()}`,
          font: "12px sans-serif",
          fillColor: color,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -25),
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3000000),
        } as any;
      }

      dataSource.entities.add(entity);
    });
  }, [alerts, selectedAlertId]);

  // Handle Interactions (Hover & Click)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // Hover (Tooltip)
    handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      const pickedObjects = viewer.scene.drillPick(movement.endPosition);

      // We use drillPick because we might pick a temperature rectangle first, we want to find if there's a station
      let stationIdFound: string | null = null;

      for (const pickedObject of pickedObjects) {
        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.properties) {
          const stationId = pickedObject.id.properties.getValue(viewer.clock.currentTime)?.stationId;
          if (stationId) {
            stationIdFound = stationId;
            break;
          }
        }
      }

      if (stationIdFound) {
        (viewer.container as HTMLElement).style.cursor = "pointer";
        const hoveredStation = stations.find(s => s.id === stationIdFound);
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

      (viewer.container as HTMLElement).style.cursor = "default";
      setTooltipState(prev => prev.visible ? { ...prev, visible: false } : prev);

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // Click (Select)
    handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedObjects = viewer.scene.drillPick(movement.position);

      let stationIdFound: string | null = null;
      let alertIdFound: string | null = null;

      for (const pickedObject of pickedObjects) {
        if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.properties) {
          const props = pickedObject.id.properties.getValue(viewer.clock.currentTime);
          if (props?.stationId && !stationIdFound) {
            stationIdFound = props.stationId;
          }
          if (props?.alertId && !alertIdFound) {
            alertIdFound = props.alertId;
          }
        }
      }

      if (onSelectAlert) {
        onSelectAlert(alertIdFound);
      }

      onSelectStation(stationIdFound);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [onSelectStation, stations]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={cesiumContainerRef}
        className="absolute inset-0 h-full w-full"
      />

      {alerts.length > 0 && <AlertLegend />}

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
