import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, type Group } from 'three'

import { stableHash } from '@/features/galaxy/layout/deterministic-hash'
import type { GalaxyBounds } from '@/features/galaxy/layout/galaxy-bounds'
import type { OverviewCamera } from '@/features/galaxy/layout/overview-camera'
import type { SceneQuality } from '@/features/galaxy/scene/scene-quality'
import {
  BACKGROUND_VISUAL_CONFIG,
  SCENE_COLORS,
} from '@/features/galaxy/scene/scene-visuals'
import {
  SoftPointField,
  type SoftPointData,
} from '@/features/galaxy/scene/soft-point-field'

interface GalaxyEnvironmentProps {
  active: boolean
  bounds: GalaxyBounds
  camera: OverviewCamera
  motionEnabled: boolean
  quality: SceneQuality
  reducedMotion: boolean
}

function starRandom(key: string, salt: string) {
  let value = stableHash(`${key}:${salt}`)
  value ^= value >>> 16
  value = Math.imul(value, 0x7feb352d)
  value ^= value >>> 15
  value = Math.imul(value, 0x846ca68b)
  value ^= value >>> 16
  return (value >>> 0) / 0xffffffff
}

function createStarField(
  count: number,
  bounds: GalaxyBounds,
  salt: string,
  depth: { minimum: number; range: number },
  spread: number,
  baseSize: number,
  temperatures: readonly string[],
): SoftPointData {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const brightness = new Float32Array(count)
  const colors = new Float32Array(count * 3)
  const color = new Color()
  const horizontalRadius = Math.max(bounds.size.x * spread, 13)
  const verticalRadius = Math.max(bounds.size.y * spread, 9)

  for (let index = 0; index < count; index += 1) {
    const key = `${salt}:${index}`
    const angle = starRandom(key, 'angle') * Math.PI * 2
    const radius = Math.sqrt(starRandom(key, 'radius'))
    const drift = 0.82 + starRandom(key, 'drift') * 0.34

    positions[index * 3] =
      bounds.center.x + Math.cos(angle) * radius * horizontalRadius * drift
    positions[index * 3 + 1] =
      bounds.center.y + Math.sin(angle) * radius * verticalRadius * drift
    positions[index * 3 + 2] =
      bounds.min.z -
      depth.minimum -
      starRandom(key, 'depth') * depth.range
    sizes[index] =
      baseSize * (0.52 + Math.pow(starRandom(key, 'size'), 2.1) * 1.9)
    brightness[index] = 0.48 + starRandom(key, 'brightness') * 0.72
    const temperatureIndex = Math.min(
      temperatures.length - 1,
      Math.floor(starRandom(key, 'temperature') * temperatures.length),
    )
    color.set(temperatures[temperatureIndex])
    colors[index * 3] = color.r
    colors[index * 3 + 1] = color.g
    colors[index * 3 + 2] = color.b
  }

  return { positions, sizes, brightness, colors }
}

const STAR_TEMPERATURES = {
  distant: ['#7999c6', '#aebdd0', '#d8c2aa'],
  mid: ['#9ec9ee', '#eef3f7', '#efc38f'],
  bright: ['#b9dcff', '#fff8e8', '#ffc887'],
} as const

export function GalaxyEnvironment({
  active,
  bounds,
  camera,
  motionEnabled,
  quality,
  reducedMotion,
}: GalaxyEnvironmentProps) {
  const distantGroupRef = useRef<Group>(null)
  const midGroupRef = useRef<Group>(null)
  const dustGroupRef = useRef<Group>(null)
  const distantStars = useMemo(
    () =>
      createStarField(
        quality.distantStarCount,
        bounds,
        `${quality.viewportClass}:distant`,
        { minimum: 10, range: 28 },
        1.72,
        BACKGROUND_VISUAL_CONFIG.distantSize,
        STAR_TEMPERATURES.distant,
      ),
    [bounds, quality.distantStarCount, quality.viewportClass],
  )
  const midStars = useMemo(
    () =>
      createStarField(
        quality.midStarCount,
        bounds,
        `${quality.viewportClass}:mid`,
        { minimum: 4.5, range: 13 },
        1.32,
        BACKGROUND_VISUAL_CONFIG.midSize,
        STAR_TEMPERATURES.mid,
      ),
    [bounds, quality.midStarCount, quality.viewportClass],
  )
  const foregroundDust = useMemo(
    () =>
      createStarField(
        quality.foregroundDustCount,
        bounds,
        `${quality.viewportClass}:foreground`,
        { minimum: 1.4, range: 6 },
        1.06,
        BACKGROUND_VISUAL_CONFIG.dustSize,
        STAR_TEMPERATURES.bright,
      ),
    [bounds, quality.foregroundDustCount, quality.viewportClass],
  )

  useFrame((_, delta) => {
    if (!motionEnabled || reducedMotion) return
    if (distantGroupRef.current) {
      distantGroupRef.current.rotation.z +=
        delta * BACKGROUND_VISUAL_CONFIG.motionSpeed * 0.12
    }
    if (midGroupRef.current) {
      midGroupRef.current.rotation.z -=
        delta * BACKGROUND_VISUAL_CONFIG.motionSpeed * 0.3
    }
    if (dustGroupRef.current) {
      dustGroupRef.current.rotation.z +=
        delta * BACKGROUND_VISUAL_CONFIG.motionSpeed * 0.46
    }
  })

  return (
    <>
      <color attach="background" args={[SCENE_COLORS.background]} />
      <fog
        attach="fog"
        args={[SCENE_COLORS.background, camera.distance + 16, camera.distance + 62]}
      />

      <group ref={distantGroupRef}>
        <SoftPointField
          color="#ffffff"
          data={distantStars}
          maxPointSize={4.2}
          opacity={active ? BACKGROUND_VISUAL_CONFIG.distantOpacity : 0.46}
        />
      </group>
      <group ref={midGroupRef}>
        <SoftPointField
          color="#ffffff"
          data={midStars}
          maxPointSize={6.4}
          opacity={active ? BACKGROUND_VISUAL_CONFIG.midOpacity : 0.55}
        />
      </group>
      <group ref={dustGroupRef}>
        <SoftPointField
          color="#ffffff"
          data={foregroundDust}
          maxPointSize={8}
          opacity={BACKGROUND_VISUAL_CONFIG.dustOpacity}
        />
      </group>
    </>
  )
}
