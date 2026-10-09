import type { ObservationStation, OceanVariable } from '../types/ocean';
import type { ModelComparisonResult } from '../components/StationDetailCard';

function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  
  let dLon = (lon2 - lon1) % 360;
  if (dLon > 180) dLon -= 360;
  if (dLon < -180) dLon += 360;
  dLon = (dLon * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateModelComparison(
  station: ObservationStation,
  activeVariable: OceanVariable | null,
  layerData: any
): ModelComparisonResult | null {
  if (!activeVariable || !layerData || !layerData.points || layerData.points.length === 0) {
    return null;
  }

  let stationVal: number | undefined;
  let variableLabel = '';
  let unit = '';

  if (activeVariable === 'temperature') {
    stationVal = station.latestObservation?.temperatureC;
    variableLabel = 'Temperature';
    unit = '°C';
  } else if (activeVariable === 'salinity') {
    stationVal = station.latestObservation?.salinityPsu;
    variableLabel = 'Salinity';
    unit = 'PSU';
  } else if (activeVariable === 'currents') {
    stationVal = station.latestObservation?.currentSpeedMs;
    variableLabel = 'Current Speed';
    unit = 'm/s';
  }

  if (stationVal === undefined || stationVal === null || !Number.isFinite(stationVal)) {
    return null;
  }

  let nearestPoint = null;
  let minDistance = Infinity;

  for (const pt of layerData.points) {
    let ptVal: number | undefined;
    if (activeVariable === 'temperature') {
      ptVal = pt.temperatureC;
    } else if (activeVariable === 'salinity') {
      ptVal = pt.salinityPsu;
    } else if (activeVariable === 'currents') {
      ptVal = pt.speedMs;
    }

    if (ptVal === undefined || ptVal === null || !Number.isFinite(ptVal)) {
      continue;
    }

    const dist = getHaversineDistanceKm(station.latitude, station.longitude, pt.latitude, pt.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestPoint = pt;
    }
  }

  if (!nearestPoint || minDistance === Infinity) {
    return null;
  }

  let modelVal = 0;
  if (activeVariable === 'temperature') {
    modelVal = nearestPoint.temperatureC;
  } else if (activeVariable === 'salinity') {
    modelVal = nearestPoint.salinityPsu;
  } else if (activeVariable === 'currents') {
    modelVal = nearestPoint.speedMs;
  }

  const difference = stationVal - modelVal;

  return {
    variableLabel,
    unit,
    stationValue: stationVal,
    modelValue: modelVal,
    difference,
    distanceKm: minDistance,
  };
}
