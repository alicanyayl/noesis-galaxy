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

export function createPhilosopherGalaxyPosition(
  philosopher: PhilosopherSummary,
): GalaxyPosition {
  const cluster = getSchoolCluster(philosopher.school)
  const pathProgress = historicalPathProgress(philosopher.birthYear.numeric)
  const point = historicalCurvePoint(pathProgress)
  const tangent = historicalCurveTangent(Math.min(pathProgress, 1))
  const normal = { x: -tangent.y, y: tangent.x }
  const schoolBand = deterministicSigned(cluster.key, 'curve-band') * 0.62
  const localBand =
    deterministicSigned(philosopher.id, `${cluster.key}:local-band`) * 0.38
  const offset = schoolBand + localBand

  return {
    x: point.x + normal.x * offset,
    y: point.y + normal.y * offset,
    z:
      point.z +
      deterministicSigned(cluster.key, 'curve-depth') * 0.28 +
      deterministicSigned(philosopher.id, `${cluster.key}:local-depth`) * 0.36,
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
