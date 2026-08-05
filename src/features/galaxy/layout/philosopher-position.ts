import type { PhilosopherSummary } from '@/api/philosophers'
import type {
  GalaxyPhilosopherNode,
  GalaxyPosition,
} from '@/features/galaxy/types/galaxy'

import { deterministicSigned } from './deterministic-hash'
import { classifyHistoricalEra } from './eras'
import {
  historicalCurvePoint,
  historicalCurveTangent,
  historicalPathProgress,
} from './historical-curve'
import { getSchoolCluster } from './school-clusters'
import { createPhilosopherNodeVariant } from './node-variant'

export function createSchoolArcOffset(
  philosopherId: string,
  schoolKey: string,
  pathProgress: number,
) {
  const band = deterministicSigned(schoolKey, 'curve-band') * 0.68
  const local = deterministicSigned(
    philosopherId,
    `${schoolKey}:local-band`,
  ) * 0.42
  const arc = Math.sin(pathProgress * Math.PI * 5.4 + band) * 0.2

  return {
    lateral: band + local + arc,
    depth:
      deterministicSigned(schoolKey, 'curve-depth') * 0.62 +
      deterministicSigned(philosopherId, `${schoolKey}:local-depth`) * 0.72,
  }
}

export function createPhilosopherGalaxyPosition(
  philosopher: PhilosopherSummary,
): GalaxyPosition {
  const cluster = getSchoolCluster(philosopher.school)
  const pathProgress = historicalPathProgress(philosopher.birthYear.numeric)
  const point = historicalCurvePoint(pathProgress)
  const tangent = historicalCurveTangent(Math.min(pathProgress, 1))
  const normal = { x: -tangent.y, y: tangent.x }
  const offset = createSchoolArcOffset(
    philosopher.id,
    cluster.key,
    pathProgress,
  )

  return {
    x: point.x + normal.x * offset.lateral,
    y: point.y + normal.y * offset.lateral,
    z: point.z + offset.depth,
  }
}

export function createGalaxyPhilosopherNode(
  philosopher: PhilosopherSummary,
): GalaxyPhilosopherNode {
  const cluster = getSchoolCluster(philosopher.school)
  const era = classifyHistoricalEra(philosopher.birthYear.numeric)
  const pathProgress = historicalPathProgress(philosopher.birthYear.numeric)

  return {
    philosopher,
    position: createPhilosopherGalaxyPosition(philosopher),
    era,
    color: era.color,
    schoolKey: cluster.key,
    schoolLabel: cluster.label,
    pathProgress,
    variant: createPhilosopherNodeVariant(philosopher),
  }
}

export function createGalaxyPhilosopherNodes(
  philosophers: PhilosopherSummary[],
) {
  return philosophers
    .map(createGalaxyPhilosopherNode)
    .sort(
      (first, second) =>
        first.pathProgress - second.pathProgress ||
        first.philosopher.name.localeCompare(second.philosopher.name),
    )
}
