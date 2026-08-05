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

export function createHistoricalSpiralPosition(
  progress: number,
): GalaxyPosition {
  if (progress > 1) {
    return { x: 9.8, y: -4.6, z: 0.25 }
  }

  const t = clamp(progress, 0, 1)
  const angle = -Math.PI * 0.42 + t * Math.PI * 4.72
  const radius = 0.68 + Math.pow(t, 0.84) * 8.65

  return {
    x: Math.cos(angle) * radius * 1.08,
    y: Math.sin(angle) * radius * 0.67,
    z:
      -0.82 +
      t * 1.68 +
      Math.sin(angle * 0.54) * 0.54 +
      Math.cos(angle * 0.22) * 0.2,
  }
}

export function historicalCurvePoint(progress: number): GalaxyPosition {
  return createHistoricalSpiralPosition(progress)
}

export function createEchoArmPosition(
  progress: number,
  armIndex: 0 | 1,
): GalaxyPosition {
  const t = clamp(progress, 0, 1)
  const source = createHistoricalSpiralPosition(t)
  const rotation = armIndex === 0 ? Math.PI * 0.68 : -Math.PI * 0.64
  const scale = armIndex === 0 ? 0.96 : 0.9
  const cosine = Math.cos(rotation)
  const sine = Math.sin(rotation)
  const depthWave = Math.sin(t * Math.PI * 2.4 + armIndex * Math.PI) * 0.46

  return {
    x: (source.x * cosine - source.y * sine) * scale,
    y: (source.x * sine + source.y * cosine) * scale,
    z: source.z * 0.78 + depthWave - 0.72 - armIndex * 0.34,
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

export function sampleEchoArm(
  armIndex: 0 | 1,
  start = 0,
  end = 1,
  segments = 88,
) {
  return Array.from({ length: segments + 1 }, (_, index) =>
    createEchoArmPosition(
      start + (end - start) * (index / segments),
      armIndex,
    ),
  )
}
