import type { PhilosopherSummary } from '@/api/philosophers'
import type {
  GalaxyPhilosopherNode,
  GalaxyPosition,
} from '@/features/galaxy/types/galaxy'

import { deterministicSigned } from './deterministic-hash'
import { classifyHistoricalEra } from './eras'
import { mapHistoricalYearToX } from './historical-axis'
import { getSchoolCluster } from './school-clusters'

export function createPhilosopherGalaxyPosition(
  philosopher: PhilosopherSummary,
): GalaxyPosition {
  const cluster = getSchoolCluster(philosopher.school)

  return {
    x: mapHistoricalYearToX(philosopher.birthYear.numeric),
    y:
      cluster.y +
      deterministicSigned(philosopher.id, `${cluster.key}:local-y`) * 0.58,
    z:
      cluster.z +
      deterministicSigned(philosopher.id, `${cluster.key}:local-z`) * 0.62,
  }
}

export function createGalaxyPhilosopherNode(
  philosopher: PhilosopherSummary,
): GalaxyPhilosopherNode {
  const cluster = getSchoolCluster(philosopher.school)
  const era = classifyHistoricalEra(philosopher.birthYear.numeric)

  return {
    philosopher,
    position: createPhilosopherGalaxyPosition(philosopher),
    era,
    color: era.color,
    schoolKey: cluster.key,
    schoolLabel: cluster.label,
  }
}

export function createGalaxyPhilosopherNodes(
  philosophers: PhilosopherSummary[],
) {
  return philosophers
    .map(createGalaxyPhilosopherNode)
    .sort(
      (first, second) =>
        first.position.x - second.position.x ||
        first.philosopher.name.localeCompare(second.philosopher.name),
    )
}
