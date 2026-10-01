import { demoStations } from "../data/demoStations";
import { getTimedStation } from "../data/demoStationSnapshots";
import { getWaveCondition } from "../data/demoWaveConditions";
import { getStationModelComparison } from "../data/demoModelProfiles";
import { getTimeIso } from "../data/demoTime";
import type { TimeIndex, ObservationStation } from "../types/ocean";
import type { OceanAlert, AlertSeverity, AlertFilters, AlertReason } from "../types/alerts";

export const ALERT_THRESHOLDS = {
  current: {
    low: 0.35,
    medium: 0.55,
    high: 0.75
  },
  wave: {
    low: 1.5,
    medium: 2.5,
    high: 3.5
  },
  mismatch: {
    temperatureC: {
      low: 0.75,
      medium: 1.25,
      high: 1.75
    },
    salinityPsu: {
      low: 0.30,
      medium: 0.55,
      high: 0.80
    },
    currentSpeedMs: {
      low: 0.15,
      medium: 0.28,
      high: 0.40
    }
  }
} as const;

export function getSeverityFromThresholds(
  value: number,
  thresholds: {
    low: number;
    medium: number;
    high: number;
  }
): AlertSeverity | null {
  if (value >= thresholds.high) return "high";
  if (value >= thresholds.medium) return "medium";
  if (value >= thresholds.low) return "low";
  return null;
}

export function getHighestSeverity(severities: AlertSeverity[]): AlertSeverity {
  if (severities.includes("high")) return "high";
  if (severities.includes("medium")) return "medium";
  return "low";
}

function getRecommendedAction(severity: AlertSeverity): string {
  if (severity === "high") {
    return "Prioritize analyst review in this simulated scenario; inspect the condition and nearby data before making real-world decisions.";
  }
  if (severity === "medium") {
    return "Prioritize review of this station and inspect nearby demo observations.";
  }
  return "Monitor this demo condition and compare it with nearby stations.";
}

export function generateStationAlerts(
  station: ObservationStation,
  timeIndex: TimeIndex
): OceanAlert[] {
  const alerts: OceanAlert[] = [];
  const timedStation = getTimedStation(station, timeIndex);
  const timeIso = getTimeIso(timeIndex);
  const currentSpeed = timedStation.latestObservation.currentSpeedMs;
  
  // Current Alert
  const currentSeverity = getSeverityFromThresholds(currentSpeed, ALERT_THRESHOLDS.current);
  if (currentSeverity) {
    alerts.push({
      id: `${station.id}-current-${timeIndex}`,
      timeIndex,
      timeIso,
      severity: currentSeverity,
      type: "current",
      title: "Elevated Current",
      stationId: station.id,
      stationName: station.name,
      stationType: station.type,
      latitude: station.latitude,
      longitude: station.longitude,
      reasons: [{
        label: "Observed Current Speed",
        detail: `Elevated demo current: ${currentSpeed.toFixed(2)} m/s`,
        threshold: `${currentSeverity} threshold: ${ALERT_THRESHOLDS.current[currentSeverity]} m/s`,
        measuredValue: `${currentSpeed.toFixed(2)} m/s`
      }],
      recommendedAction: getRecommendedAction(currentSeverity),
      isDemo: true
    });
  }

  // Wave Alert
  const waveCondition = getWaveCondition(station, timeIndex);
  const waveSeverity = getSeverityFromThresholds(waveCondition.waveHeightM, ALERT_THRESHOLDS.wave);
  if (waveSeverity) {
    alerts.push({
      id: `${station.id}-wave-${timeIndex}`,
      timeIndex,
      timeIso,
      severity: waveSeverity,
      type: "wave",
      title: "Elevated Wave Condition",
      stationId: station.id,
      stationName: station.name,
      stationType: station.type,
      latitude: station.latitude,
      longitude: station.longitude,
      reasons: [{
        label: "Demo Wave Height",
        detail: `Elevated demo wave height: ${waveCondition.waveHeightM.toFixed(2)} m`,
        threshold: `${waveSeverity} threshold: ${ALERT_THRESHOLDS.wave[waveSeverity]} m`,
        measuredValue: `${waveCondition.waveHeightM.toFixed(2)} m`
      }],
      recommendedAction: getRecommendedAction(waveSeverity),
      isDemo: true
    });
  }

  // Mismatch Alert
  const comparison = getStationModelComparison(station, timeIndex);
  const surfaceComparison = comparison.depthComparisons.find(d => d.depthM === 0);
  if (surfaceComparison) {
    const tempSev = getSeverityFromThresholds(surfaceComparison.temperatureAbsoluteErrorC, ALERT_THRESHOLDS.mismatch.temperatureC);
    const salSev = getSeverityFromThresholds(surfaceComparison.salinityAbsoluteErrorPsu, ALERT_THRESHOLDS.mismatch.salinityPsu);
    const speedSev = getSeverityFromThresholds(surfaceComparison.currentSpeedAbsoluteErrorMs, ALERT_THRESHOLDS.mismatch.currentSpeedMs);
    
    const mismatchSeverities: AlertSeverity[] = [];
    const reasons: AlertReason[] = [];
    
    if (tempSev) {
      mismatchSeverities.push(tempSev);
      reasons.push({
        label: "Surface Temperature Mismatch",
        detail: `Temperature error: ${surfaceComparison.temperatureAbsoluteErrorC.toFixed(2)} °C`,
        threshold: `${tempSev} threshold: ${ALERT_THRESHOLDS.mismatch.temperatureC[tempSev]} °C`,
        measuredValue: `${surfaceComparison.temperatureAbsoluteErrorC.toFixed(2)} °C`
      });
    }
    if (salSev) {
      mismatchSeverities.push(salSev);
      reasons.push({
        label: "Surface Salinity Mismatch",
        detail: `Salinity error: ${surfaceComparison.salinityAbsoluteErrorPsu.toFixed(2)} PSU`,
        threshold: `${salSev} threshold: ${ALERT_THRESHOLDS.mismatch.salinityPsu[salSev]} PSU`,
        measuredValue: `${surfaceComparison.salinityAbsoluteErrorPsu.toFixed(2)} PSU`
      });
    }
    if (speedSev) {
      mismatchSeverities.push(speedSev);
      reasons.push({
        label: "Surface Current Speed Mismatch",
        detail: `Current speed error: ${surfaceComparison.currentSpeedAbsoluteErrorMs.toFixed(2)} m/s`,
        threshold: `${speedSev} threshold: ${ALERT_THRESHOLDS.mismatch.currentSpeedMs[speedSev]} m/s`,
        measuredValue: `${surfaceComparison.currentSpeedAbsoluteErrorMs.toFixed(2)} m/s`
      });
    }

    if (mismatchSeverities.length > 0) {
      const highestSeverity = getHighestSeverity(mismatchSeverities);
      alerts.push({
        id: `${station.id}-mismatch-${timeIndex}`,
        timeIndex,
        timeIso,
        severity: highestSeverity,
        type: "mismatch",
        title: "Model-Observation Mismatch",
        stationId: station.id,
        stationName: station.name,
        stationType: station.type,
        latitude: station.latitude,
        longitude: station.longitude,
        reasons,
        recommendedAction: getRecommendedAction(highestSeverity),
        isDemo: true
      });
    }
  }

  // Quality Alert
  if (station.qualityFlag === "PENDING" || station.qualityFlag === "SUSPECT") {
    const qSev: AlertSeverity = station.qualityFlag === "SUSPECT" ? "medium" : "low";
    alerts.push({
      id: `${station.id}-quality-${timeIndex}`,
      timeIndex,
      timeIso,
      severity: qSev,
      type: "quality",
      title: "Observation Quality Review",
      stationId: station.id,
      stationName: station.name,
      stationType: station.type,
      latitude: station.latitude,
      longitude: station.longitude,
      reasons: [{
        label: "Quality Flag",
        detail: `Station quality is currently marked as ${station.qualityFlag}.`,
        threshold: station.qualityFlag === "SUSPECT" ? "SUSPECT flag triggers medium severity" : "PENDING flag triggers low severity"
      }],
      recommendedAction: getRecommendedAction(qSev),
      isDemo: true
    });
  }

  return alerts;
}

const severityOrder = { high: 0, medium: 1, low: 2 };

export function generateAlertsForTime(timeIndex: TimeIndex): OceanAlert[] {
  const allAlerts: OceanAlert[] = [];
  
  for (const station of demoStations) {
    const stationAlerts = generateStationAlerts(station, timeIndex);
    allAlerts.push(...stationAlerts);
  }

  // Demo scenario overrides to guarantee requirements at t=0
  // Requirement: at least 3 alerts at t=0, 1 high alert at t=0, 1 alert linked to a buoy at t=0.
  // The deterministic rules + buoy-03 / buoy-05 wave conditions already handle this naturally,
  // but if we were missing them, we'd inject here. We just sort them.

  allAlerts.sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }
    return (a.stationName || "").localeCompare(b.stationName || "");
  });

  return allAlerts;
}

export function filterAlerts(
  alerts: OceanAlert[],
  filters: AlertFilters
): OceanAlert[] {
  return alerts.filter(alert => {
    const matchesSeverity = filters.severities.length === 0 || filters.severities.includes(alert.severity);
    const matchesType = filters.types.length === 0 || filters.types.includes(alert.type);
    return matchesSeverity && matchesType;
  });
}

export function getAlertCountsBySeverity(alerts: OceanAlert[]): Record<AlertSeverity, number> {
  const counts = { high: 0, medium: 0, low: 0 };
  for (const a of alerts) {
    counts[a.severity]++;
  }
  return counts;
}
