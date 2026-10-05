export type DataSourceId = "local_demo" | "backend_demo" | "archived_dataset";

export interface SourceStatus {
  id: DataSourceId;
  label: string;
  available: boolean;
  isDemo: boolean;
  description: string;
  lastProcessedAt?: string | null;
  originalDatasetId?: string | null;
}

export interface SourceMetadata {
  source: DataSourceId;
  sourceLabel: string;
  isDemo: boolean;
  disclaimer: string;
  originalDatasetId?: string | null;
  processedAt?: string | null;
  timeSteps: string[];
  depthLevels: number[];
  supportedVariables: string[];
  geographicBounds: Record<string, number>;
}

export interface ApiLayerResponse {
  source: DataSourceId;
  variable: string;
  depthM: number;
  timeIndex: number;
  timeIso: string;
  units: string;
  minValue: number;
  maxValue: number;
  points: any[]; // Specific point types handled dynamically
  isDemo: boolean;
  sourceLabel: string;
  disclaimer: string;
}

export interface ApiObservationStation {
  id: string;
  name: string;
  type: "argo" | "buoy" | "glider";
  latitude: number;
  longitude: number;
  timestamp: string;
  qualityFlag: "GOOD" | "SUSPECT" | "PENDING";
  latestObservation: {
    temperatureC: number;
    salinityPsu: number;
    currentSpeedMs: number;
  };
  depthM: number;
  platformDescription: string;
  route?: { latitude: number; longitude: number }[] | null;
}
