import type { GalaxyBounds } from './galaxy-bounds'
import type { GalaxyPosition } from '@/features/galaxy/types/galaxy'

export interface SupernovaLandmark {
  id: string
  position: GalaxyPosition
  scale: number
  phase: number
}

const NORMALIZED_ANCHORS = [
  { x: -0.42, y: 0.4, z: -2.7 },
  { x: 0.46, y: -0.34, z: -3.8 },
  { x: 0.34, y: 0.42, z: -5.1 },
  { x: -0.46, y: -0.38, z: -4.4 },
] as const

export function createSupernovaLandmarks(
  bounds: GalaxyBounds,
  count: number,
): SupernovaLandmark[] {
  return NORMALIZED_ANCHORS.slice(0, Math.max(0, Math.min(count, 4))).map(
    (anchor, index) => ({
      id: `supernova-${index + 1}`,
      position: {
        x: bounds.center.x + bounds.size.x * anchor.x,
        y: bounds.center.y + bounds.size.y * anchor.y,
        z: bounds.min.z + anchor.z,
      },
      scale: 0.84 + index * 0.08,
      phase: index * 1.7,
    }),
  )
}

export function supernovaShellOpacityAtTime(
  elapsedSeconds: number,
  motionEnabled: boolean,
  reducedMotion: boolean,
  baseOpacity: number,
  pulseSpeed: number,
) {
  return (
    baseOpacity +
    (motionEnabled && !reducedMotion
      ? Math.sin(elapsedSeconds * pulseSpeed) * 0.018
      : 0)
  )
}
