import * as Cesium from "cesium";

interface ColorStop {
  stop: number;
  hex: string;
}

// Cold to Very hot palette
const TEMPERATURE_PALETTE: ColorStop[] = [
  { stop: 0.0, hex: "#163B8C" }, // deep blue
  { stop: 0.2, hex: "#00A6FB" }, // blue
  { stop: 0.4, hex: "#21D4B4" }, // teal
  { stop: 0.6, hex: "#F7E733" }, // yellow
  { stop: 0.8, hex: "#F97316" }, // orange
  { stop: 1.0, hex: "#DC2626" }, // red
];

export function getTemperatureColor(
  value: number,
  minValue: number,
  maxValue: number,
  alpha: number = 1.0
): Cesium.Color {
  // Normalize value to 0-1 range
  let normalized = (value - minValue) / (maxValue - minValue);
  
  // Clamp to 0-1
  normalized = Math.max(0, Math.min(1, normalized));

  // Find the appropriate stops
  let lowerStop = TEMPERATURE_PALETTE[0];
  let upperStop = TEMPERATURE_PALETTE[TEMPERATURE_PALETTE.length - 1];

  for (let i = 0; i < TEMPERATURE_PALETTE.length - 1; i++) {
    if (normalized >= TEMPERATURE_PALETTE[i].stop && normalized <= TEMPERATURE_PALETTE[i + 1].stop) {
      lowerStop = TEMPERATURE_PALETTE[i];
      upperStop = TEMPERATURE_PALETTE[i + 1];
      break;
    }
  }

  // Calculate interpolation factor between the two stops
  const range = upperStop.stop - lowerStop.stop;
  const factor = range === 0 ? 0 : (normalized - lowerStop.stop) / range;

  // Convert hex to Cesium.Color
  const c1 = Cesium.Color.fromCssColorString(lowerStop.hex);
  const c2 = Cesium.Color.fromCssColorString(upperStop.hex);

  // Interpolate
  const result = new Cesium.Color();
  Cesium.Color.lerp(c1, c2, factor, result);
  
  // Apply alpha
  result.alpha = alpha;

  return result;
}

// Salinity palette
const SALINITY_PALETTE: ColorStop[] = [
  { stop: 0.0, hex: "#6D28D9" }, // Fresh / low salinity purple
  { stop: 0.25, hex: "#2563EB" }, // Blue
  { stop: 0.5, hex: "#06B6D4" }, // Cyan
  { stop: 0.7, hex: "#14B8A6" }, // Teal
  { stop: 0.9, hex: "#84CC16" }, // Green
  { stop: 1.0, hex: "#FACC15" }, // Salty / high salinity yellow
];

export function getSalinityColor(
  value: number,
  minValue: number,
  maxValue: number,
  alpha: number = 1.0
): Cesium.Color {
  let normalized = (value - minValue) / (maxValue - minValue);
  normalized = Math.max(0, Math.min(1, normalized));

  let lowerStop = SALINITY_PALETTE[0];
  let upperStop = SALINITY_PALETTE[SALINITY_PALETTE.length - 1];

  for (let i = 0; i < SALINITY_PALETTE.length - 1; i++) {
    if (normalized >= SALINITY_PALETTE[i].stop && normalized <= SALINITY_PALETTE[i + 1].stop) {
      lowerStop = SALINITY_PALETTE[i];
      upperStop = SALINITY_PALETTE[i + 1];
      break;
    }
  }

  const range = upperStop.stop - lowerStop.stop;
  const factor = range === 0 ? 0 : (normalized - lowerStop.stop) / range;

  const c1 = Cesium.Color.fromCssColorString(lowerStop.hex);
  const c2 = Cesium.Color.fromCssColorString(upperStop.hex);

  const result = new Cesium.Color();
  Cesium.Color.lerp(c1, c2, factor, result);
  result.alpha = alpha;

  return result;
}

// Current speed palette
const CURRENT_SPEED_PALETTE: ColorStop[] = [
  { stop: 0.0, hex: "#38BDF8" }, // Weak: light blue
  { stop: 0.33, hex: "#22C55E" }, // Moderate: green
  { stop: 0.66, hex: "#F59E0B" }, // Strong: amber
  { stop: 1.0, hex: "#EF4444" }, // Very strong: red
];

export function getCurrentSpeedColor(
  speedMs: number,
  minSpeedMs: number,
  maxSpeedMs: number,
  alpha: number = 1.0
): Cesium.Color {
  let normalized = (speedMs - minSpeedMs) / (maxSpeedMs - minSpeedMs);
  normalized = Math.max(0, Math.min(1, normalized));

  let lowerStop = CURRENT_SPEED_PALETTE[0];
  let upperStop = CURRENT_SPEED_PALETTE[CURRENT_SPEED_PALETTE.length - 1];

  for (let i = 0; i < CURRENT_SPEED_PALETTE.length - 1; i++) {
    if (normalized >= CURRENT_SPEED_PALETTE[i].stop && normalized <= CURRENT_SPEED_PALETTE[i + 1].stop) {
      lowerStop = CURRENT_SPEED_PALETTE[i];
      upperStop = CURRENT_SPEED_PALETTE[i + 1];
      break;
    }
  }

  const range = upperStop.stop - lowerStop.stop;
  const factor = range === 0 ? 0 : (normalized - lowerStop.stop) / range;

  const c1 = Cesium.Color.fromCssColorString(lowerStop.hex);
  const c2 = Cesium.Color.fromCssColorString(upperStop.hex);

  const result = new Cesium.Color();
  Cesium.Color.lerp(c1, c2, factor, result);
  result.alpha = alpha;

  return result;
}
