import type { DepthLevel, TemperatureGridPoint, TimedTemperatureLayerData, TimeIndex } from "../types/ocean";
import { DEMO_TIME_STEPS } from "./demoTime";

// Time variation is deterministic prototype data only; it is not a real ocean forecast or live observation feed.

// Deterministic data generation for Bay of Bengal
// Lat: 8°N to 22°N
// Lon: 81°E to 98°E

const LAT_START = 8;
const LAT_END = 22;
const LON_START = 81;
const LON_END = 98;
const LAT_STEPS = 8;
const LON_STEPS = 9;

const latStepSize = (LAT_END - LAT_START) / (LAT_STEPS - 1);
const lonStepSize = (LON_END - LON_START) / (LON_STEPS - 1);

// A simple pseudo-random generation based on lat/lon to keep it deterministic
function pseudoTemp(lat: number, lon: number, depth: DepthLevel): number {
  // Base temperatures
  const baseTemp = depth === 0 ? 29 : depth === 50 ? 25 : depth === 100 ? 20 : 14;
  
  // Create a gradient (cooler in north, warmer in south, some lon variation)
  const latFactor = (lat - LAT_START) / (LAT_END - LAT_START);
  const lonFactor = (lon - LON_START) / (LON_END - LON_START);
  
  // Amplitude of variation
  const variation = depth === 0 ? 2.5 : depth === 50 ? 3.0 : depth === 100 ? 3.5 : 3.0;
  
  // Combine deterministic wave functions for a natural look without Math.random()
  const wave = Math.sin(latFactor * Math.PI) * Math.cos(lonFactor * Math.PI * 2);
  
  return baseTemp - (latFactor * 1.5) + (wave * variation);
}

function generatePointsForDepth(depth: DepthLevel): TemperatureGridPoint[] {
  const points: TemperatureGridPoint[] = [];
  for (let i = 0; i < LAT_STEPS; i++) {
    for (let j = 0; j < LON_STEPS; j++) {
      const lat = LAT_START + i * latStepSize;
      const lon = LON_START + j * lonStepSize;
      const temp = pseudoTemp(lat, lon, depth);
      points.push({
        latitude: lat,
        longitude: lon,
        depthM: depth,
        temperatureC: temp,
      });
    }
  }
  return points;
}

const dataByDepth: Record<DepthLevel, TemperatureGridPoint[]> = {
  0: generatePointsForDepth(0),
  50: generatePointsForDepth(50),
  100: generatePointsForDepth(100),
  200: generatePointsForDepth(200),
};

export function getTemperatureLayer(depthM: DepthLevel, timeIndex: TimeIndex): TimedTemperatureLayerData {
  const basePoints = dataByDepth[depthM];
  
  // Calculate depth-based time variation scaling (surface varies most)
  const depthScale = depthM === 0 ? 1 : depthM === 50 ? 0.7 : depthM === 100 ? 0.4 : 0.2;
  
  const points = basePoints.map(p => {
    // Spatial and temporal phase
    const phase = p.latitude * 0.1 + p.longitude * 0.1 + timeIndex * 0.5;
    // approximately -0.8°C to +0.8°C at surface
    const offset = Math.sin(phase) * 0.8 * depthScale;
    
    return {
      ...p,
      temperatureC: p.temperatureC + offset
    };
  });
  
  // Calculate min and max for this specific slice
  let minValue = Infinity;
  let maxValue = -Infinity;
  
  for (const p of points) {
    if (p.temperatureC < minValue) minValue = p.temperatureC;
    if (p.temperatureC > maxValue) maxValue = p.temperatureC;
  }
  
  return {
    variable: "temperature",
    depthM,
    units: "°C",
    minValue,
    maxValue,
    points,
    timeIndex,
    timeIso: DEMO_TIME_STEPS[timeIndex],
  };
}
