import type { TimeIndex, StationType } from "./ocean";

export type AlertSeverity = "low" | "medium" | "high";

export type AlertType = "current" | "wave" | "mismatch" | "quality";

export interface AlertReason {
  label: string;
  detail: string;
  threshold: string;
  measuredValue?: string;
}

export interface OceanAlert {
  id: string;
  timeIndex: TimeIndex;
  timeIso: string;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  stationId?: string;
  stationName?: string;
  stationType?: StationType;
  latitude: number;
  longitude: number;
  reasons: AlertReason[];
  recommendedAction: string;
  isDemo: true;
}

export interface AlertFilters {
  severities: AlertSeverity[];
  types: AlertType[];
}

export interface DemoScenario {
  id: "marine-safety-bay-of-bengal";
  title: string;
  description: string;
  targetAlertId: string;
  timeIndex: TimeIndex;
  cameraLongitude: number;
  cameraLatitude: number;
  cameraHeight: number;
  recommendedDemoAction: string;
  isDemo: true;
}
