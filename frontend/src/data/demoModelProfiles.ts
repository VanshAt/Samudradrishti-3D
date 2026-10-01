/**
 * Deterministic prototype comparison profiles only.
 * These values are not live observations, model outputs,
 * or a validation of any operational ocean forecast.
 */
import type { ObservationStation } from "../types/ocean";
import type { TimeIndex } from "../types/ocean";
import type {
  StationModelComparison,
  ProfileValue,
  VariableProfileComparison,
  DepthComparison
} from "../types/comparison";
import { getTimedStation } from "./demoStationSnapshots";
import { COMPARISON_DEPTHS } from "../types/comparison";
import { calculateMae, getAgreementLevel, calculateOverallAgreementScore, generateComparisonExplanation, absoluteDifference } from "../utils/modelComparison";

const LOW_AGREEMENT_STATION_IDS = new Set<string>([
  "argo-03",
  "argo-08",
  "buoy-03",
  "buoy-05"
]);

export function getStationModelComparison(
  station: ObservationStation,
  timeIndex: TimeIndex
): StationModelComparison {
  const timedStation = getTimedStation(station, timeIndex);
  const hash = station.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0);

  const observedTemp: ProfileValue[] = [];
  const modelTemp: ProfileValue[] = [];
  const tempErrors: ProfileValue[] = [];

  const observedSal: ProfileValue[] = [];
  const modelSal: ProfileValue[] = [];
  const salErrors: ProfileValue[] = [];

  const observedSpeed: ProfileValue[] = [];
  const modelSpeed: ProfileValue[] = [];
  const speedErrors: ProfileValue[] = [];

  const rawObservedTemp: ProfileValue[] = [];
  const rawModelTemp: ProfileValue[] = [];
  
  const rawObservedSal: ProfileValue[] = [];
  const rawModelSal: ProfileValue[] = [];
  
  const rawObservedSpeed: ProfileValue[] = [];
  const rawModelSpeed: ProfileValue[] = [];

  const depthComparisons: DepthComparison[] = [];

  // Determine an error modifier for some stations to simulate "Low Agreement"
  const isLargeError = LOW_AGREEMENT_STATION_IDS.has(station.id);
  const errorScale = isLargeError ? 3.0 : (station.qualityFlag !== "GOOD" ? 1.5 : 1.0);

  COMPARISON_DEPTHS.forEach((depthM) => {
    // Generate deterministic observed values for this depth
    // Surface (0m) aligns with timedStation
    let oTemp = timedStation.latestObservation.temperatureC;
    let oSal = timedStation.latestObservation.salinityPsu;
    let oSpeed = timedStation.latestObservation.currentSpeedMs;

    if (depthM === 50) {
      oTemp -= 2.5 + (hash % 10) / 10;
      oSal += 0.2;
      oSpeed *= 0.8;
    } else if (depthM === 100) {
      oTemp -= 7.0 + (hash % 15) / 10;
      oSal += 0.4;
      oSpeed *= 0.6;
    } else if (depthM === 200) {
      oTemp -= 12.0 + (hash % 20) / 10;
      oSal += 0.6;
      oSpeed *= 0.4;
    }
    
    // clamp to realistic values just in case
    oTemp = Math.max(9, oTemp);
    oSal = Math.min(36.5, Math.max(31, oSal));
    oSpeed = Math.max(0.01, oSpeed);

    // Generate model values based on observed plus error
    // Error depends on depth, hash, timeIndex
    const depthModifier = 1 + (depthM / 200);
    const mTempErr = Math.sin(hash + depthM + timeIndex) * 0.4 * errorScale * depthModifier;
    const mSalErr = Math.cos(hash + depthM + timeIndex) * 0.15 * errorScale * depthModifier;
    const mSpeedErr = Math.sin((hash * 2) + depthM + timeIndex) * 0.08 * errorScale * depthModifier;

    const mTemp = oTemp + mTempErr;
    const mSal = oSal + mSalErr;
    let mSpeed = oSpeed + mSpeedErr;
    if (mSpeed < 0) mSpeed = 0;

    const tErr = absoluteDifference(oTemp, mTemp);
    const sErr = absoluteDifference(oSal, mSal);
    const spErr = absoluteDifference(oSpeed, mSpeed);

    rawObservedTemp.push({ depthM, value: oTemp });
    rawModelTemp.push({ depthM, value: mTemp });

    rawObservedSal.push({ depthM, value: oSal });
    rawModelSal.push({ depthM, value: mSal });

    rawObservedSpeed.push({ depthM, value: oSpeed });
    rawModelSpeed.push({ depthM, value: mSpeed });

    observedTemp.push({ depthM, value: Number(oTemp.toFixed(2)) });
    modelTemp.push({ depthM, value: Number(mTemp.toFixed(2)) });
    tempErrors.push({ depthM, value: Number(tErr.toFixed(2)) });

    observedSal.push({ depthM, value: Number(oSal.toFixed(2)) });
    modelSal.push({ depthM, value: Number(mSal.toFixed(2)) });
    salErrors.push({ depthM, value: Number(sErr.toFixed(2)) });

    observedSpeed.push({ depthM, value: Number(oSpeed.toFixed(2)) });
    modelSpeed.push({ depthM, value: Number(mSpeed.toFixed(2)) });
    speedErrors.push({ depthM, value: Number(spErr.toFixed(2)) });

    depthComparisons.push({
      depthM,
      observedTemperatureC: Number(oTemp.toFixed(2)),
      modelTemperatureC: Number(mTemp.toFixed(2)),
      temperatureAbsoluteErrorC: Number(tErr.toFixed(2)),
      observedSalinityPsu: Number(oSal.toFixed(2)),
      modelSalinityPsu: Number(mSal.toFixed(2)),
      salinityAbsoluteErrorPsu: Number(sErr.toFixed(2)),
      observedCurrentSpeedMs: Number(oSpeed.toFixed(2)),
      modelCurrentSpeedMs: Number(mSpeed.toFixed(2)),
      currentSpeedAbsoluteErrorMs: Number(spErr.toFixed(2))
    });
  });

  const tMae = calculateMae(rawObservedTemp, rawModelTemp);
  const sMae = calculateMae(rawObservedSal, rawModelSal);
  const cMae = calculateMae(rawObservedSpeed, rawModelSpeed);

  const agreementLevel = getAgreementLevel(tMae, sMae, cMae);
  const overallScore = calculateOverallAgreementScore(tMae, sMae, cMae);

  const temperature: VariableProfileComparison = {
    variable: "temperature",
    unit: "°C",
    observed: observedTemp,
    model: modelTemp,
    absoluteErrors: tempErrors,
    mae: Number(tMae.toFixed(2)),
    maxAbsoluteError: Number(Math.max(...tempErrors.map(e => e.value)).toFixed(2))
  };

  const salinity: VariableProfileComparison = {
    variable: "salinity",
    unit: "PSU",
    observed: observedSal,
    model: modelSal,
    absoluteErrors: salErrors,
    mae: Number(sMae.toFixed(2)),
    maxAbsoluteError: Number(Math.max(...salErrors.map(e => e.value)).toFixed(2))
  };

  const currentSpeed: VariableProfileComparison = {
    variable: "currentSpeed",
    unit: "m/s",
    observed: observedSpeed,
    model: modelSpeed,
    absoluteErrors: speedErrors,
    mae: Number(cMae.toFixed(2)),
    maxAbsoluteError: Number(Math.max(...speedErrors.map(e => e.value)).toFixed(2))
  };

  const baseComparison = {
    temperature,
    salinity,
    currentSpeed,
    agreementLevel
  };

  return {
    stationId: station.id,
    timeIndex,
    timeIso: timedStation.timestamp,
    depthComparisons,
    temperature,
    salinity,
    currentSpeed,
    agreementLevel,
    overallScore: Math.round(overallScore),
    explanation: generateComparisonExplanation(baseComparison),
    isDemo: true
  };
}
