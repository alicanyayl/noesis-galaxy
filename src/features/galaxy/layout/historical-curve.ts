import type { GalaxyPosition } from '@/features/galaxy/types/galaxy'

const PATH_START_YEAR = -650
const PATH_END_YEAR = 2_025

export const UNKNOWN_PATH_PROGRESS = 1.08

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

/**
 * Converts historical years to an era-weighted scalar. Each era receives
 * enough authored arc length to remain legible while chronology stays ordered.
 */
export function historicalPathProgress(year: number | null) {
  if (year === null || !Number.isFinite(year)) return UNKNOWN_PATH_PROGRESS

  const boundedYear = clamp(year, PATH_START_YEAR, PATH_END_YEAR)
  const segments = [
    { startYear: PATH_START_YEAR, endYear: 500, start: 0, end: 0.23 },
    { startYear: 500, endYear: 1_500, start: 0.23, end: 0.39 },
    { startYear: 1_500, endYear: 1_800, start: 0.39, end: 0.58 },
    { startYear: 1_800, endYear: 1_945, start: 0.58, end: 0.82 },
    { startYear: 1_945, endYear: PATH_END_YEAR, start: 0.82, end: 1 },
  ]
  const segment =
    segments.find((candidate) => boundedYear <= candidate.endYear) ??
    segments.at(-1)!
  const localProgress =
    (boundedYear - segment.startYear) /
    (segment.endYear - segment.startYear)

  return segment.start + localProgress * (segment.end - segment.start)
}

export function historicalCurvePoint(progress: number): GalaxyPosition {
  if (progress > 1) {
    return { x: 10.6, y: -5.2, z: -0.4 }
  }

  const t = clamp(progress, 0, 1)
  const angle = -Math.PI * 0.2 + t * Math.PI * 2.18
  const radius = 1.15 + t * 8.75

  return {
    x: Math.cos(angle) * radius * 1.12,
    y: Math.sin(angle) * radius * 0.68,
    z: -1.15 + t * 2.3 + Math.sin(angle * 0.72) * 0.42,
  }
}

export function historicalCurveTangent(progress: number): GalaxyPosition {
  const before = historicalCurvePoint(clamp(progress - 0.001, 0, 1))
  const after = historicalCurvePoint(clamp(progress + 0.001, 0, 1))
  const length = Math.hypot(after.x - before.x, after.y - before.y) || 1

  return {
    x: (after.x - before.x) / length,
    y: (after.y - before.y) / length,
    z: (after.z - before.z) / length,
  }
}

export function sampleHistoricalCurve(
  start = 0,
  end = 1,
  segments = 96,
) {
  return Array.from({ length: segments + 1 }, (_, index) =>
    historicalCurvePoint(start + (end - start) * (index / segments)),
  )
}
