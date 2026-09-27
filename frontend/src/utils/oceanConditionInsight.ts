import type { ObservationStation, OceanVariable, DepthLevel, OceanConditionInsight, OceanConditionReason, OceanConditionSeverity } from "./../types/ocean";

export function calculateOceanConditionInsight(
  station: ObservationStation,
  activeVariable: OceanVariable | null,
  selectedDepth: DepthLevel
): OceanConditionInsight {
  let score = 0;
  const reasons: OceanConditionReason[] = [];

  // 1. Data quality
  if (station.qualityFlag === "SUSPECT") {
    score += 20;
    reasons.push({
      label: "Observation quality needs review",
      detail: "This demo station is marked SUSPECT."
    });
  } else if (station.qualityFlag === "PENDING") {
    score += 10;
    reasons.push({
      label: "Observation quality is pending",
      detail: "This demo station has not completed validation."
    });
  }

  // 2. Observed current
  if (station.latestObservation.currentSpeedMs >= 0.60) {
    score += 25;
    reasons.push({
      label: "Elevated observed current",
      detail: `Current speed is ${station.latestObservation.currentSpeedMs.toFixed(2)} m/s.`
    });
  } else if (station.latestObservation.currentSpeedMs >= 0.35) {
    score += 10;
    reasons.push({
      label: "Moderate observed current",
      detail: `Current speed is ${station.latestObservation.currentSpeedMs.toFixed(2)} m/s.`
    });
  }

  // 3. Warm surface water
  if (selectedDepth === 0 && station.latestObservation.temperatureC >= 30) {
    score += 15;
    reasons.push({
      label: "Elevated surface temperature",
      detail: `Surface temperature is ${station.latestObservation.temperatureC.toFixed(1)} °C.`
    });
  }

  // 4. Active map context
  if (activeVariable === "currents" && station.latestObservation.currentSpeedMs >= 0.35) {
    reasons.push({
      label: "Current-layer context",
      detail: "The selected map layer provides context for interpreting local current conditions."
    });
  }
  
  if (activeVariable === "salinity" && selectedDepth >= 100) {
    reasons.push({
      label: "Deep salinity-layer context",
      detail: "The selected map layer provides context for interpreting local salinity conditions."
    });
  }

  if (activeVariable === "temperature" && selectedDepth >= 100) {
    reasons.push({
      label: "Subsurface temperature-layer context",
      detail: "The selected map layer provides context for interpreting local thermal conditions."
    });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine severity
  let severity: OceanConditionSeverity = "routine";
  let summary = "No elevated demo condition threshold is detected for this station.";
  let recommendedAction = "Continue routine monitoring and compare with nearby stations.";

  if (score >= 50) {
    severity = "elevated";
    summary = "This station should be prioritized for review within the demo scenario.";
    recommendedAction = "Review the latest observation quality and local map patterns before taking operational decisions.";
  } else if (score >= 25) {
    severity = "caution";
    summary = "This station has one or more conditions worth monitoring in the demo dataset.";
    recommendedAction = "Monitor subsequent readings and inspect nearby observation platforms.";
  }

  return {
    severity,
    score,
    summary,
    reasons,
    recommendedAction,
    isDemo: true
  };
}
