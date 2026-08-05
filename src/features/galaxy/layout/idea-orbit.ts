import { deterministicSigned, deterministicUnit } from './deterministic-hash'
import type { GalaxyPosition } from '@/features/galaxy/types/galaxy'

export interface IdeaOrbit {
  radiusX: number
  radiusY: number
  radiusZ: number
  inclinationX: number
  inclinationY: number
  speed: number
  phase: number
  direction: 1 | -1
}

export function createIdeaOrbit(
  philosopherId: string,
  ideaId: string,
  index: number,
): IdeaOrbit {
  const key = `${philosopherId}:${ideaId}`
  const radiusX =
    1.28 +
    index * 0.12 +
    deterministicUnit(key, 'orbit-radius-x') * 0.24
  return {
    radiusX,
    radiusY:
      radiusX * (0.58 + deterministicUnit(key, 'orbit-radius-y') * 0.1),
    radiusZ: 0.06 + deterministicUnit(key, 'orbit-radius-z') * 0.1,
    inclinationX: deterministicSigned(key, 'orbit-inclination-x') * 0.2,
    inclinationY: deterministicSigned(key, 'orbit-inclination-y') * 0.14,
    speed: 0.045 + deterministicUnit(key, 'orbit-speed') * 0.04,
    phase: deterministicUnit(key, 'orbit-phase') * Math.PI * 2,
    direction: deterministicUnit(key, 'orbit-direction') > 0.5 ? 1 : -1,
  }
}

export function ideaOrbitAngleAtTime(
  orbit: IdeaOrbit,
  elapsedSeconds: number,
  reducedMotion: boolean,
) {
  return orbit.phase + (reducedMotion ? 0 : elapsedSeconds * orbit.speed * orbit.direction)
}

export function ideaOrbitPositionAtAngle(
  orbit: IdeaOrbit,
  angle: number,
): GalaxyPosition {
  return {
    x: Math.cos(angle) * orbit.radiusX,
    y: Math.sin(angle) * orbit.radiusY,
    z: Math.sin(angle * 2) * orbit.radiusZ,
  }
}

export function createIdeaFocusPosition(
  center: GalaxyPosition,
): GalaxyPosition {
  return {
    x: center.x + 1.42,
    y: center.y - 0.18,
    z: center.z + 0.38,
  }
}
