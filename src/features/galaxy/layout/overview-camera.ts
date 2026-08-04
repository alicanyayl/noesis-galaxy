import type { GalaxyBounds } from '@/features/galaxy/layout/galaxy-bounds'
import type { GalaxyPosition } from '@/features/galaxy/types/galaxy'

export interface CameraViewport {
  width: number
  height: number
}

export interface OverviewCamera {
  position: GalaxyPosition
  target: GalaxyPosition
  distance: number
  minDistance: number
  maxDistance: number
  near: number
  far: number
}

const DEFAULT_VERTICAL_FOV = 42

export function calculateOverviewCamera(
  bounds: GalaxyBounds,
  viewport: CameraViewport,
  overviewPadding: number,
  verticalFovDegrees = DEFAULT_VERTICAL_FOV,
): OverviewCamera {
  const safeHeight = Math.max(viewport.height, 1)
  const aspect = Math.max(viewport.width / safeHeight, 0.25)
  const halfVerticalFov =
    (Math.max(verticalFovDegrees, 1) * Math.PI) / 360
  const tangent = Math.tan(halfVerticalFov)
  const halfWidth = Math.max(bounds.size.x / 2, 1)
  const halfHeight = Math.max(bounds.size.y / 2, 1)
  const widthDistance = halfWidth / (tangent * aspect)
  const heightDistance = halfHeight / tangent
  const depthAllowance = bounds.size.z / 2 + 1
  const distance =
    Math.max(widthDistance, heightDistance) *
      Math.max(overviewPadding, 1) +
    depthAllowance

  return {
    position: {
      x: bounds.center.x,
      y: bounds.center.y,
      z: bounds.center.z + distance,
    },
    target: { ...bounds.center },
    distance,
    minDistance: Math.max(3.2, Math.min(distance * 0.22, 6.2)),
    maxDistance: Math.max(52, distance * 2.6),
    near: 0.1,
    far: Math.max(160, distance * 4),
  }
}
