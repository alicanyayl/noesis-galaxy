import { useMemo } from 'react'

import { deterministicSigned } from '@/features/galaxy/layout/deterministic-hash'
import type { GalaxyBounds } from '@/features/galaxy/layout/galaxy-bounds'
import type { OverviewCamera } from '@/features/galaxy/layout/overview-camera'
import type { SceneQuality } from '@/features/galaxy/scene/scene-quality'
import { SCENE_COLORS } from '@/features/galaxy/scene/scene-visuals'

interface GalaxyEnvironmentProps {
  active: boolean
  bounds: GalaxyBounds
  camera: OverviewCamera
  quality: SceneQuality
}

function createStarPositions(
  count: number,
  bounds: GalaxyBounds,
  salt: string,
  depthOffset: number,
) {
  const positions = new Float32Array(count * 3)
  const horizontalRadius = Math.max(bounds.size.x * 0.8, 12)
  const verticalRadius = Math.max(bounds.size.y * 0.9, 8)

  for (let index = 0; index < count; index += 1) {
    const key = `${salt}:${index}`
    positions[index * 3] =
      bounds.center.x +
      deterministicSigned(key, 'x') * horizontalRadius
    positions[index * 3 + 1] =
      bounds.center.y +
      deterministicSigned(key, 'y') * verticalRadius
    positions[index * 3 + 2] =
      bounds.min.z -
      depthOffset -
      Math.abs(deterministicSigned(key, 'z')) * 8
  }

  return positions
}

export function GalaxyEnvironment({
  active,
  bounds,
  camera,
  quality,
}: GalaxyEnvironmentProps) {
  const farStars = useMemo(
    () =>
      createStarPositions(
        quality.decorativeStarCount,
        bounds,
        quality.viewportClass,
        7,
      ),
    [bounds, quality],
  )
  const dust = useMemo(
    () =>
      createStarPositions(
        Math.floor(quality.decorativeStarCount * 0.32),
        bounds,
        `${quality.viewportClass}:dust`,
        3.5,
      ),
    [bounds, quality],
  )

  return (
    <>
      <color attach="background" args={[SCENE_COLORS.background]} />
      <fog
        attach="fog"
        args={[
          SCENE_COLORS.background,
          camera.distance + 5,
          camera.distance + 28,
        ]}
      />

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[farStars, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={SCENE_COLORS.dust}
          opacity={active ? 0.28 : 0.22}
          size={0.045}
          sizeAttenuation
          transparent
          depthWrite={false}
        />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={SCENE_COLORS.structuralBright}
          opacity={active ? 0.16 : 0.12}
          size={0.075}
          sizeAttenuation
          transparent
          depthWrite={false}
        />
      </points>
    </>
  )
}
