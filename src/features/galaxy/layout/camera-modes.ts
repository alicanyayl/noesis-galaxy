import type { OverviewCamera } from './overview-camera'
import type { SceneQuality } from '@/features/galaxy/scene/scene-quality'
import type { CameraMode, GalaxyPosition } from '@/features/galaxy/types/galaxy'

export interface GalaxyCameraState {
  mode: CameraMode
  position: GalaxyPosition
  target: GalaxyPosition
  distance: number
  minDistance: number
  maxDistance: number
}

export const CAMERA_CONTROL_CONFIG = {
  dollyToCursor: false,
  dollySpeed: 0.34,
  truckSpeed: 0.5,
  minPolarAngle: Math.PI * 0.22,
  maxPolarAngle: Math.PI * 0.78,
} as const

export function createGalaxyCameraState(
  mode: CameraMode,
  overview: OverviewCamera,
  quality: SceneQuality,
  philosopherFocus: GalaxyPosition | null,
  ideaFocus: GalaxyPosition | null,
): GalaxyCameraState {
  if (mode === 'idea-focus' && ideaFocus) {
    const distance = quality.ideaSelectionDistance
    return {
      mode,
      target: { ...ideaFocus },
      position: { ...ideaFocus, z: ideaFocus.z + distance },
      distance,
      minDistance: distance * 0.66,
      maxDistance: distance * 1.48,
    }
  }

  if (mode === 'philosopher-focus' && philosopherFocus) {
    const target = {
      ...philosopherFocus,
      y: philosopherFocus.y + quality.selectedTargetOffsetY,
    }
    const distance = quality.selectionDistance
    return {
      mode,
      target,
      position: { ...target, z: target.z + distance },
      distance,
      minDistance: distance * 0.64,
      maxDistance: distance * 1.52,
    }
  }

  return {
    mode: 'galaxy-overview',
    position: { ...overview.position },
    target: { ...overview.target },
    distance: overview.distance,
    minDistance: Math.max(6.5, overview.distance * 0.46),
    maxDistance: overview.distance * 1.7,
  }
}
