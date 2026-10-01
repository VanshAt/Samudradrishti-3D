/**
 * Deterministic prototype wave-condition data only. Not live wave observations or an operational forecast.
 */
import type { TimeIndex, ObservationStation } from "../types/ocean";

export interface DemoWaveCondition {
  stationId: string;
  timeIndex: TimeIndex;
  waveHeightM: number;
}

export function getWaveCondition(
  station: ObservationStation,
  timeIndex: TimeIndex
): DemoWaveCondition {
  // Use stable hash from station id
  const hash = station.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  
  // Base deterministic value using hash and timeIndex, range ~ 0.6 to 2.0
  let waveHeightM = 0.6 + (hash % 15) / 10 + Math.sin(hash + timeIndex) * 0.4;
  
  // Explicit elevated conditions to guarantee alerts
  // High wave threshold is >= 3.5m, medium is >= 2.5m
  if (station.id === "buoy-03") {
    if (timeIndex === 0) waveHeightM = 3.8; // High alert at t=0
    else if (timeIndex === 1) waveHeightM = 3.6; // High
    else waveHeightM = 2.8; // Medium
  } else if (station.id === "buoy-05") {
    if (timeIndex === 2 || timeIndex === 3) waveHeightM = 3.6; // High
    else waveHeightM = 2.7; // Medium
  } else if (station.id === "argo-01" && timeIndex === 4) {
    waveHeightM = 2.6; // Medium
  }
  
  return {
    stationId: station.id,
    timeIndex,
    waveHeightM: Number(waveHeightM.toFixed(2))
  };
}
