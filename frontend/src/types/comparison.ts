import type { DepthLevel, TimeIndex } from "./ocean";

export type AgreementLevel = "high" | "moderate" | "low";

export interface ProfileValue {
  depthM: DepthLevel;
  value: number;
}

export interface VariableProfileComparison {
  variable: "temperature" | "salinity" | "currentSpeed";
  unit: "°C" | "PSU" | "m/s";
  observed: ProfileValue[];
  model: ProfileValue[];
  absoluteErrors: ProfileValue[];
  mae: number;
  maxAbsoluteError: number;
}

export interface DepthComparison {
  depthM: DepthLevel;
  observedTemperatureC: number;
  modelTemperatureC: number;
  temperatureAbsoluteErrorC: number;
  observedSalinityPsu: number;
  modelSalinityPsu: number;
  salinityAbsoluteErrorPsu: number;
  observedCurrentSpeedMs: number;
  modelCurrentSpeedMs: number;
  currentSpeedAbsoluteErrorMs: number;
}

export interface StationModelComparison {
  stationId: string;
  timeIndex: TimeIndex;
  timeIso: string;
  depthComparisons: DepthComparison[];
  temperature: VariableProfileComparison;
  salinity: VariableProfileComparison;
  currentSpeed: VariableProfileComparison;
  agreementLevel: AgreementLevel;
  overallScore: number;
  explanation: string;
  isDemo: true;
}

export const COMPARISON_DEPTHS: DepthLevel[] = [0, 50, 100, 200];
