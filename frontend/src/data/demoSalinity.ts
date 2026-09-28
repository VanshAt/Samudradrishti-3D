/**
 * Deterministic prototype model data only.
 * Not live INCOIS ocean-model output.
 */

import type { DepthLevel, SalinityGridPoint, TimedSalinityLayerData, TimeIndex } from "../types/ocean";
import { DEMO_TIME_STEPS } from "./demoTime";

const LAT_START = 8;
const LAT_END = 22;
const LON_START = 81;
const LON_END = 98;
const LAT_STEPS = 8;
const LON_STEPS = 9;

const latStepSize = (LAT_END - LAT_START) / (LAT_STEPS - 1);
const lonStepSize = (LON_END - LON_START) / (LON_STEPS - 1);

function pseudoSalinity(lat: number, lon: number, depth: DepthLevel): number {
  // Base salinity depending on depth
  const baseSalinity = depth === 0 ? 33.2 : depth === 50 ? 34.4 : depth === 100 ? 35.0 : 35.5;
  
  // Fresh water influence in the north/east (Ganges-Brahmaputra and others)
  const latFactor = (lat - LAT_START) / (LAT_END - LAT_START);
  const lonFactor = (lon - LON_START) / (LON_END - LON_START);
  
  // More variation at surface, less at depth
  const variation = depth === 0 ? 2.3 : depth === 50 ? 1.4 : depth === 100 ? 1.0 : 0.5;
  
  // Fresher in north (high latFactor) and east (high lonFactor)
  const freshness = (latFactor * 0.7 + lonFactor * 0.3);
  
  return baseSalinity - (freshness * variation);
}

function generatePointsForDepth(depth: DepthLevel): SalinityGridPoint[] {
  const points: SalinityGridPoint[] = [];
  for (let i = 0; i < LAT_STEPS; i++) {
    for (let j = 0; j < LON_STEPS; j++) {
      const lat = LAT_START + i * latStepSize;
      const lon = LON_START + j * lonStepSize;
      const salinity = Number(pseudoSalinity(lat, lon, depth).toFixed(2));
      points.push({
        latitude: lat,
        longitude: lon,
        depthM: depth,
        salinityPsu: salinity,
      });
    }
  }
  return points;
}

const dataByDepth: Record<DepthLevel, SalinityGridPoint[]> = {
  0: generatePointsForDepth(0),
  50: generatePointsForDepth(50),
  100: generatePointsForDepth(100),
  200: generatePointsForDepth(200),
};

export function getSalinityLayer(depthM: DepthLevel, timeIndex: TimeIndex): TimedSalinityLayerData {
  const basePoints = dataByDepth[depthM];
  
  const depthScale = depthM === 0 ? 1 : depthM === 50 ? 0.7 : depthM === 100 ? 0.4 : 0.2;
  
  const points = basePoints.map(p => {
    const phase = p.latitude * 0.2 + p.longitude * 0.2 + timeIndex * 0.7;
    // approximately -0.25 to +0.25 PSU
    const offset = Math.sin(phase) * 0.25 * depthScale;
    return {
      ...p,
      salinityPsu: Number((p.salinityPsu + offset).toFixed(2))
    };
  });
  
  let minValue = Infinity;
  let maxValue = -Infinity;
  
  for (const p of points) {
    if (p.salinityPsu < minValue) minValue = p.salinityPsu;
    if (p.salinityPsu > maxValue) maxValue = p.salinityPsu;
  }
  
  return {
    variable: "salinity",
    depthM,
    units: "PSU",
    minValue,
    maxValue,
    points,
    timeIndex,
    timeIso: DEMO_TIME_STEPS[timeIndex],
  };
}
