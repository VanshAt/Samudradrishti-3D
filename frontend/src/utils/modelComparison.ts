import type { ProfileValue, AgreementLevel, StationModelComparison } from "../types/comparison";

export function absoluteDifference(observed: number, model: number): number {
  return Math.abs(observed - model);
}

export function calculateMae(observed: ProfileValue[], model: ProfileValue[]): number {
  if (observed.length === 0 || model.length === 0 || observed.length !== model.length) {
    throw new Error("Profiles must have the same non-zero length to calculate MAE.");
  }

  let totalError = 0;
  let count = 0;

  for (let i = 0; i < observed.length; i++) {
    if (observed[i].depthM !== model[i].depthM) {
      throw new Error(`Depth mismatch at index ${i}: ${observed[i].depthM} vs ${model[i].depthM}`);
    }
    totalError += absoluteDifference(observed[i].value, model[i].value);
    count++;
  }

  return totalError / count;
}

export function getAgreementLevel(
  temperatureMae: number,
  salinityMae: number,
  currentSpeedMae: number
): AgreementLevel {
  if (temperatureMae < 0.60 && salinityMae < 0.25 && currentSpeedMae < 0.12) {
    return "high";
  }
  if (temperatureMae < 1.25 && salinityMae < 0.55 && currentSpeedMae < 0.28) {
    return "moderate";
  }
  return "low";
}

/**
 * Calculates an overall agreement score (0-100) based on normalized MAE values.
 * Uses maximum thresholds (1.25 °C, 0.55 PSU, 0.28 m/s) to normalize errors.
 * Score is clamped to ensure it stays between 0 and 100.
 */
export function calculateOverallAgreementScore(
  temperatureMae: number,
  salinityMae: number,
  currentSpeedMae: number
): number {
  const normalizedError = (
    (temperatureMae / 1.25) +
    (salinityMae / 0.55) +
    (currentSpeedMae / 0.28)
  ) / 3;

  const score = 100 - (normalizedError * 100);
  return Math.max(0, Math.min(100, score));
}

export function generateComparisonExplanation(
  comparison: Pick<StationModelComparison, "temperature" | "salinity" | "currentSpeed" | "agreementLevel">
): string {
  type ComparisonVariableKey = "temperature" | "salinity" | "currentSpeed";

  const temperatureNormalizedError = comparison.temperature.mae / 1.25;
  const salinityNormalizedError = comparison.salinity.mae / 0.55;
  const currentNormalizedError = comparison.currentSpeed.mae / 0.28;

  let worstKey: ComparisonVariableKey = "temperature";
  let worstLabel = "temperature";
  let highestNormalizedError = temperatureNormalizedError;

  if (salinityNormalizedError > highestNormalizedError) {
    worstKey = "salinity";
    worstLabel = "salinity";
    highestNormalizedError = salinityNormalizedError;
  }

  if (currentNormalizedError > highestNormalizedError) {
    worstKey = "currentSpeed";
    worstLabel = "current speed";
    highestNormalizedError = currentNormalizedError;
  }

  const worstProfile = comparison[worstKey];

  let maxDepth = -1;
  let maxError = -1;
  
  for (const err of worstProfile.absoluteErrors) {
    if (err.value > maxError) {
      maxError = err.value;
      maxDepth = err.depthM;
    }
  }

  let text = `Model agreement is ${comparison.agreementLevel}. `;
  text += `The largest normalized mismatch occurs in ${worstLabel}, with the maximum error at a depth of ${maxDepth} m. `;
  text += "Based on deterministic demo comparison data.";

  return text;
}
