import type { GalaxyPosition } from '@/features/galaxy/types/galaxy'

export interface GalaxyBounds {
  min: GalaxyPosition
  max: GalaxyPosition
  center: GalaxyPosition
  size: GalaxyPosition
}

const EMPTY_BOUNDS: GalaxyBounds = {
  min: { x: -8, y: -4, z: -2 },
  max: { x: 8, y: 4, z: 2 },
  center: { x: 0, y: 0, z: 0 },
  size: { x: 16, y: 8, z: 4 },
}

export function calculateGalaxyBounds(
  positions: readonly GalaxyPosition[],
): GalaxyBounds {
  if (positions.length === 0) {
    return EMPTY_BOUNDS
  }

  const min = { x: Infinity, y: Infinity, z: Infinity }
  const max = { x: -Infinity, y: -Infinity, z: -Infinity }

  for (const position of positions) {
    min.x = Math.min(min.x, position.x)
    min.y = Math.min(min.y, position.y)
    min.z = Math.min(min.z, position.z)
    max.x = Math.max(max.x, position.x)
    max.y = Math.max(max.y, position.y)
    max.z = Math.max(max.z, position.z)
  }

  return {
    min,
    max,
    center: {
      x: (min.x + max.x) / 2,
      y: (min.y + max.y) / 2,
      z: (min.z + max.z) / 2,
    },
    size: {
      x: max.x - min.x,
      y: max.y - min.y,
      z: max.z - min.z,
    },
  }
}
