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
