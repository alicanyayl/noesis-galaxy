import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import { AdditiveBlending } from 'three'

import {
  deterministicSigned,
  deterministicUnit,
} from '@/features/galaxy/layout/deterministic-hash'
import {
  createEchoArmPosition,
  historicalCurvePoint,
  historicalPathProgress,
} from '@/features/galaxy/layout/historical-curve'
import type { SceneQuality } from '@/features/galaxy/scene/scene-quality'
import { SCENE_COLORS } from '@/features/galaxy/scene/scene-visuals'
import {
  SoftPointField,
  type SoftPointData,
} from '@/features/galaxy/scene/soft-point-field'

function softNoise(key: string, axis: string) {
  return (
    deterministicSigned(key, `${axis}:a`) +
    deterministicSigned(key, `${axis}:b`) +
    deterministicSigned(key, `${axis}:c`)
  ) / 3
}

function createArmDust(
  count: number,
  salt: string,
  armIndex: -1 | 0 | 1,
): SoftPointData {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const brightness = new Float32Array(count)

  for (let index = 0; index < count; index += 1) {
    const key = `${salt}:${index}`
    const progress = Math.pow(deterministicUnit(key, 'progress'), 0.94)
    const point =
      armIndex === -1
        ? historicalCurvePoint(progress)
        : createEchoArmPosition(progress, armIndex)
    const spread = 0.22 + Math.sin(progress * Math.PI) * 0.42 + progress * 0.3

    positions[index * 3] = point.x + softNoise(key, 'x') * spread * 1.34
    positions[index * 3 + 1] = point.y + softNoise(key, 'y') * spread * 0.7
    positions[index * 3 + 2] =
      point.z + softNoise(key, 'z') * (0.38 + progress * 0.7)
    sizes[index] =
      0.09 + Math.pow(deterministicUnit(key, 'size'), 2.1) * (armIndex < 0 ? 0.39 : 0.3)
    brightness[index] =
      (armIndex < 0 ? 0.52 : 0.4) + deterministicUnit(key, 'light') * 0.46
  }

  return { positions, sizes, brightness }
}

function createCoreDust(count: number): SoftPointData {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const brightness = new Float32Array(count)

  for (let index = 0; index < count; index += 1) {
    const key = `core-dust:${index}`
    const radius = Math.pow(deterministicUnit(key, 'radius'), 1.8) * 2.8
    const angle = deterministicUnit(key, 'angle') * Math.PI * 2
    positions[index * 3] = Math.cos(angle) * radius * 1.18
    positions[index * 3 + 1] = Math.sin(angle) * radius * 0.58
    positions[index * 3 + 2] = deterministicSigned(key, 'z') * (0.28 + radius * 0.12) - 0.45
    sizes[index] = 0.11 + deterministicUnit(key, 'size') * 0.5
    brightness[index] = 0.5 + deterministicUnit(key, 'brightness') * 0.62
  }

  return { positions, sizes, brightness }
}

function createArmHaze(
  count: number,
  salt: string,
  armIndex: -1 | 0 | 1,
): SoftPointData {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const brightness = new Float32Array(count)

  for (let index = 0; index < count; index += 1) {
    const key = `${salt}:haze:${index}`
    const progress = Math.pow(deterministicUnit(key, 'progress'), 0.9)
    const point =
      armIndex === -1
        ? historicalCurvePoint(progress)
        : createEchoArmPosition(progress, armIndex)
    const spread = 0.3 + Math.sin(progress * Math.PI) * 0.48 + progress * 0.28

    positions[index * 3] = point.x + softNoise(key, 'x') * spread * 1.5
    positions[index * 3 + 1] = point.y + softNoise(key, 'y') * spread * 0.76
    positions[index * 3 + 2] =
      point.z + softNoise(key, 'z') * (0.58 + progress * 0.82)
    sizes[index] = 0.7 + deterministicUnit(key, 'size') * 1.35
    brightness[index] = 0.4 + deterministicUnit(key, 'light') * 0.4
  }

  return { positions, sizes, brightness }
}

function createCoreHaze(count: number): SoftPointData {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const brightness = new Float32Array(count)

  for (let index = 0; index < count; index += 1) {
    const key = `core-haze:${index}`
    const radius = Math.pow(deterministicUnit(key, 'radius'), 1.55) * 2.4
    const angle = deterministicUnit(key, 'angle') * Math.PI * 2
    positions[index * 3] = Math.cos(angle) * radius * 1.16
    positions[index * 3 + 1] = Math.sin(angle) * radius * 0.55
    positions[index * 3 + 2] = deterministicSigned(key, 'z') * 0.58 - 0.48
    sizes[index] = 1.1 + deterministicUnit(key, 'size') * 2.6
    brightness[index] = 0.42 + deterministicUnit(key, 'brightness') * 0.5
  }

  return { positions, sizes, brightness }
}

const ERA_MARKERS = [
  { label: 'Ancient', year: -250 },
  { label: 'Modern', year: 1_872 },
  { label: 'Contemporary', year: 2_005 },
] as const

export function HistoricalStreams({
  focused,
  quality,
}: {
  focused: boolean
  quality: SceneQuality
}) {
  const dustFields = useMemo(
    () => [
      createArmDust(quality.armDustCount, 'history', -1),
      createArmDust(Math.floor(quality.armDustCount * 0.74), 'echo-a', 0),
      createArmDust(Math.floor(quality.armDustCount * 0.62), 'echo-b', 1),
    ],
    [quality.armDustCount],
  )
  const coreDust = useMemo(
    () => createCoreDust(Math.max(260, Math.floor(quality.armDustCount * 0.42))),
    [quality.armDustCount],
  )
  const hazeFields = useMemo(
    () => [
      createArmHaze(Math.max(620, Math.floor(quality.armDustCount * 1.2)), 'history', -1),
      createArmHaze(Math.max(380, Math.floor(quality.armDustCount * 0.75)), 'echo-a', 0),
      createArmHaze(Math.max(320, Math.floor(quality.armDustCount * 0.65)), 'echo-b', 1),
    ],
    [quality.armDustCount],
  )
  const coreHaze = useMemo(
    () => createCoreHaze(Math.max(100, Math.floor(quality.armDustCount * 0.13))),
    [quality.armDustCount],
  )

  return (
    <group>
      <group position={[0, 0, -0.45]}>
        <SoftPointField
          color={SCENE_COLORS.coreGlow}
          data={coreHaze}
          maxPointSize={22}
          opacity={focused ? 0.045 : 0.18}
        />
        <SoftPointField
          color={SCENE_COLORS.streamBright}
          data={coreDust}
          maxPointSize={4.5}
          opacity={focused ? 0.16 : 0.42}
        />
        <mesh position={[0, 0, 0.22]}>
          <sphereGeometry args={[0.11, 20, 16]} />
          <meshBasicMaterial
            color={SCENE_COLORS.streamBright}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, 0.2]} scale={3.4}>
          <sphereGeometry args={[0.11, 18, 14]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={SCENE_COLORS.coreGlow}
            depthWrite={false}
            opacity={focused ? 0.06 : 0.15}
            toneMapped={false}
            transparent
          />
        </mesh>
      </group>

      {hazeFields.map((data, index) => (
        <SoftPointField
          key={`haze-${index}`}
          color={index === 0 ? SCENE_COLORS.streamBright : index === 1 ? SCENE_COLORS.streamCyan : SCENE_COLORS.streamViolet}
          data={data}
          maxPointSize={index === 0 ? 15 : 12}
          opacity={focused ? 0.03 : index === 0 ? 0.14 : 0.085}
        />
      ))}

      {dustFields.map((data, index) => (
        <SoftPointField
          key={index}
          color={index === 0 ? SCENE_COLORS.streamBright : index === 1 ? SCENE_COLORS.streamCyan : SCENE_COLORS.streamViolet}
          data={data}
          maxPointSize={index === 0 ? 4.2 : 3.6}
          opacity={focused ? 0.12 : index === 0 ? 0.5 : 0.3}
        />
      ))}

      {!focused
        ? ERA_MARKERS.map((era) => {
            const point = historicalCurvePoint(historicalPathProgress(era.year))
            return (
              <Html
                key={era.label}
                center
                position={[point.x, point.y + 0.46, point.z]}
                style={{ pointerEvents: 'none' }}
              >
                <span className="galaxy-era-label">{era.label}</span>
              </Html>
            )
          })
        : null}
    </group>
  )
}
