/**
 * Deterministic prototype model data only.
 * Not live INCOIS ocean-model output.
 */

import type { DepthLevel, CurrentGridPoint, CurrentLayerData } from "../types/ocean";

const LAT_START = 8;
const LAT_END = 22;
const LON_START = 81;
const LON_END = 98;
const LAT_STEPS = 5;
const LON_STEPS = 6;

const latStepSize = (LAT_END - LAT_START) / (LAT_STEPS - 1);
const lonStepSize = (LON_END - LON_START) / (LON_STEPS - 1);

function pseudoCurrent(
  lat: number,
  lon: number,
  depth: DepthLevel
): { uMs: number; vMs: number } {
  const latFactor = (lat - LAT_START) / (LAT_END - LAT_START);
  const lonFactor = (lon - LON_START) / (LON_END - LON_START);

  const depthScale =
    depth === 0 ? 1.0 :
    depth === 50 ? 0.6 :
    depth === 100 ? 0.4 :
    0.2;

  const backgroundU =
    Math.sin(latFactor * Math.PI * 2) *
    Math.cos(lonFactor * Math.PI) *
    0.18;

  const backgroundV =
    Math.cos(latFactor * Math.PI) *
    Math.sin(lonFactor * Math.PI * 2) *
    0.18;

  let zoneU = 0;
  let zoneV = 0;

  // Surface-only, deterministic enhanced-current zones.
  // Their boundaries intentionally include generated grid positions.
  if (depth === 0 && lat >= 14 && lat <= 16 && lon >= 86 && lon <= 89) {
    zoneU = 0.68;
    zoneV = 0.34;
  } else if (depth === 0 && lat >= 18 && lat <= 20 && lon >= 89 && lon <= 93) {
    zoneU = -0.46;
    zoneV = -0.58;
  } else if (depth === 0 && lat >= 10 && lat <= 12 && lon >= 83 && lon <= 85) {
    zoneU = 0.72;
    zoneV = -0.28;
  }

  const uMs = (backgroundU + zoneU) * depthScale;
  const vMs = (backgroundV + zoneV) * depthScale;

  return {
    uMs: Math.abs(uMs) < 0.03 ? 0.03 * depthScale : uMs,
    vMs: Math.abs(vMs) < 0.03 ? 0.03 * depthScale : vMs,
  };
}

function generatePointsForDepth(depth: DepthLevel): CurrentGridPoint[] {
  const points: CurrentGridPoint[] = [];
  for (let i = 0; i < LAT_STEPS; i++) {
    for (let j = 0; j < LON_STEPS; j++) {
      const lat = LAT_START + i * latStepSize;
      const lon = LON_START + j * lonStepSize;
      const { uMs, vMs } = pseudoCurrent(lat, lon, depth);
      
      const roundedU = Number(uMs.toFixed(3));
      const roundedV = Number(vMs.toFixed(3));
      const speedMs = Number(
        Math.sqrt(roundedU * roundedU + roundedV * roundedV).toFixed(3)
      );
      
      // Calculate direction in degrees (0 = North, 90 = East, 180 = South, 270 = West)
      let directionDegrees = Math.atan2(roundedU, roundedV) * (180 / Math.PI);
      if (directionDegrees < 0) {
        directionDegrees += 360;
      }

      points.push({
        latitude: lat,
        longitude: lon,
        depthM: depth,
        uMs: roundedU,
        vMs: roundedV,
        speedMs,
        directionDegrees,
      });
    }
  }
  return points;
}

const dataByDepth: Record<DepthLevel, CurrentGridPoint[]> = {
  0: generatePointsForDepth(0),
  50: generatePointsForDepth(50),
  100: generatePointsForDepth(100),
  200: generatePointsForDepth(200),
};

export function getCurrentLayer(depthM: DepthLevel): CurrentLayerData {
  const points = dataByDepth[depthM];
  
  let minValue = Infinity;
  let maxValue = -Infinity;
  
  for (const p of points) {
    if (p.speedMs < minValue) minValue = p.speedMs;
    if (p.speedMs > maxValue) maxValue = p.speedMs;
  }
  
  return {
    variable: "currents",
    depthM,
    units: "m/s",
    minValue,
    maxValue,
    points
  };
}

const surfaceElevatedCurrentCount = dataByDepth[0].filter(
  (point) => point.speedMs >= 0.6
).length;

console.info(
  `[Demo Currents] Surface vectors >= 0.60 m/s: ${surfaceElevatedCurrentCount}`
);
