export type StationType = "argo" | "buoy" | "glider";
export type QualityFlag = "GOOD" | "SUSPECT" | "PENDING";

export interface LatestObservation {
  temperatureC: number;
  salinityPsu: number;
  currentSpeedMs: number;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface ObservationStation {
  id: string;
  name: string;
  type: StationType;
  latitude: number;
  longitude: number;
  timestamp: string;
  qualityFlag: QualityFlag;
  latestObservation: LatestObservation;
  depthM: number;
  platformDescription: string;
  route?: RoutePoint[];
}

export type OceanVariable = "temperature" | "salinity" | "currents";

export type DepthLevel = 0 | 50 | 100 | 200;

export interface TemperatureGridPoint {
  latitude: number;
  longitude: number;
  depthM: DepthLevel;
  temperatureC: number;
}

export interface TemperatureLayerData {
  variable: "temperature";
  depthM: DepthLevel;
  units: "°C";
  minValue: number;
  maxValue: number;
  points: TemperatureGridPoint[];
}

export interface SalinityGridPoint {
  latitude: number;
  longitude: number;
  depthM: DepthLevel;
  salinityPsu: number;
}

export interface SalinityLayerData {
  variable: "salinity";
  depthM: DepthLevel;
  units: "PSU";
  minValue: number;
  maxValue: number;
  points: SalinityGridPoint[];
}

export interface CurrentGridPoint {
  latitude: number;
  longitude: number;
  depthM: DepthLevel;
  uMs: number;
  vMs: number;
  speedMs: number;
  directionDegrees: number;
}

export interface CurrentLayerData {
  variable: "currents";
  depthM: DepthLevel;
  units: "m/s";
  minValue: number;
  maxValue: number;
  points: CurrentGridPoint[];
}

export type OceanConditionSeverity = "routine" | "caution" | "elevated";

export interface OceanConditionReason {
  label: string;
  detail: string;
}

export interface OceanConditionInsight {
  severity: OceanConditionSeverity;
  score: number;
  summary: string;
  reasons: OceanConditionReason[];
  recommendedAction: string;
  isDemo: true;
}

export type TimeIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface TimedTemperatureLayerData extends TemperatureLayerData {
  timeIndex: TimeIndex;
  timeIso: string;
}

export interface TimedSalinityLayerData extends SalinityLayerData {
  timeIndex: TimeIndex;
  timeIso: string;
}

export interface TimedCurrentLayerData extends CurrentLayerData {
  timeIndex: TimeIndex;
  timeIso: string;
}

export interface StationSnapshot {
  stationId: string;
  timeIndex: TimeIndex;
  timestamp: string;
  latestObservation: LatestObservation;
}

