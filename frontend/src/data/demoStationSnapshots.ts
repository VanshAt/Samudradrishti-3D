import type { ObservationStation, StationSnapshot, TimeIndex } from "../types/ocean";
import { DEMO_TIME_STEPS } from "./demoTime";

// “Time variation is deterministic prototype data only; it is not a real ocean forecast or live observation feed.”

export function getStationSnapshot(
  station: ObservationStation,
  timeIndex: TimeIndex
): StationSnapshot {
  // Deterministic offset based on time index and station ID hash
  const hash = station.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  
  // temperature changes approximately ±0.7°C maximum
  const tempOffset = Math.sin(hash + timeIndex * 0.5) * 0.7;
  // salinity changes approximately ±0.2 PSU maximum
  const salOffset = Math.cos(hash + timeIndex * 0.7) * 0.2;
  // current speed stays non-negative and changes approximately ±0.15 m/s
  const speedOffset = Math.sin(hash + timeIndex) * 0.15;

  let speedMs = station.latestObservation.currentSpeedMs + speedOffset;
  if (speedMs < 0) speedMs = 0;

  return {
    stationId: station.id,
    timeIndex,
    timestamp: DEMO_TIME_STEPS[timeIndex],
    latestObservation: {
      temperatureC: Number((station.latestObservation.temperatureC + tempOffset).toFixed(2)),
      salinityPsu: Number((station.latestObservation.salinityPsu + salOffset).toFixed(2)),
      currentSpeedMs: Number(speedMs.toFixed(2)),
    }
  };
}

export function getTimedStation(
  station: ObservationStation,
  timeIndex: TimeIndex
): ObservationStation {
  const snapshot = getStationSnapshot(station, timeIndex);
  return {
    ...station,
    timestamp: snapshot.timestamp,
    latestObservation: snapshot.latestObservation
  };
}

export function getTimedStations(
  stations: ObservationStation[],
  timeIndex: TimeIndex
): ObservationStation[] {
  return stations.map(s => getTimedStation(s, timeIndex));
}
