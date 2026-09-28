export const DEMO_TIME_STEPS = [
  "2026-09-21T00:00:00Z",
  "2026-09-21T06:00:00Z",
  "2026-09-21T12:00:00Z",
  "2026-09-21T18:00:00Z",
  "2026-09-22T00:00:00Z",
  "2026-09-22T06:00:00Z",
  "2026-09-22T12:00:00Z",
  "2026-09-22T18:00:00Z"
] as const;

import type { TimeIndex } from "../types/ocean";

export const TIME_STEP_COUNT = DEMO_TIME_STEPS.length;

export function getTimeIso(timeIndex: TimeIndex): string {
  return DEMO_TIME_STEPS[timeIndex];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDemoTime(timeIso: string): string {
  // Format: “21 Sep 2026, 06:00 UTC”
  const match = timeIso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/);
  if (!match) return timeIso;
  const [, year, month, day, hour, minute] = match;
  return `${parseInt(day, 10)} ${MONTHS[parseInt(month, 10) - 1]} ${year}, ${hour}:${minute} UTC`;
}

export function formatDemoTimeShort(timeIso: string): string {
  // Format: “21 Sep 06:00”
  const match = timeIso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/);
  if (!match) return timeIso;
  const [, , month, day, hour, minute] = match;
  return `${parseInt(day, 10)} ${MONTHS[parseInt(month, 10) - 1]} ${hour}:${minute}`;
}
