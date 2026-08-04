import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'
import { AdditiveBlending, DoubleSide } from 'three'

import { deterministicSigned } from '@/features/galaxy/layout/deterministic-hash'
import {
  historicalCurvePoint,
  historicalPathProgress,
  sampleHistoricalCurve,
} from '@/features/galaxy/layout/historical-curve'
import { HISTORICAL_ERAS } from '@/features/galaxy/layout/eras'
import type { SceneQuality } from '@/features/galaxy/scene/scene-quality'
import {
  GALAXY_VISUAL_CONFIG,
  SCENE_COLORS,
} from '@/features/galaxy/scene/scene-visuals'

function rotatePoint(
  point: { x: number; y: number; z: number },
  angle: number,
  scale = 1,
) {
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)

  return {
    x: (point.x * cosine - point.y * sine) * scale,
    y: (point.x * sine + point.y * cosine) * scale,
    z: point.z - 0.65,
  }
}

function createArmDust(
  count: number,
  salt: string,
  rotation: number,
  scale: number,
) {
  const positions = new Float32Array(count * 3)

  for (let index = 0; index < count; index += 1) {
    const key = `${salt}:${index}`
    const progress = (index + 0.5) / count
    const point = rotatePoint(
      historicalCurvePoint(progress),
      rotation,
      scale,
    )
    const spread = 0.22 + progress * 0.78
    positions[index * 3] =
      point.x + deterministicSigned(key, 'x') * spread
    positions[index * 3 + 1] =
      point.y + deterministicSigned(key, 'y') * spread * 0.55
    positions[index * 3 + 2] =
      point.z + deterministicSigned(key, 'z') * (0.22 + progress * 0.4)
  }

  return positions
}

const ERA_PROGRESS = [
  { label: 'Ancient core', year: -250, align: 'core' },
  { label: 'Medieval orbit', year: 1_000, align: 'inner' },
  { label: 'Early modern turn', year: 1_650, align: 'turn' },
  { label: 'Modern expansion', year: 1_872, align: 'outer' },
  { label: 'Contemporary frontier', year: 2_005, align: 'frontier' },
] as const

export function HistoricalStreams({ quality }: { quality: SceneQuality }) {
  const mainPath = useMemo(() => sampleHistoricalCurve(), [])
  const echoArms = useMemo(
    () => [
      sampleHistoricalCurve(0, 1, 80).map((point) =>
        rotatePoint(point, Math.PI * 0.72, 0.96),
      ),
      sampleHistoricalCurve(0, 1, 80).map((point) =>
        rotatePoint(point, -Math.PI * 0.67, 0.9),
      ),
    ],
    [],
  )
  const dustFields = useMemo(
    () => [
      createArmDust(quality.armDustCount, 'history', 0, 1),
      createArmDust(
        Math.floor(quality.armDustCount * 0.72),
        'echo-a',
        Math.PI * 0.72,
        0.96,
      ),
      createArmDust(
        Math.floor(quality.armDustCount * 0.64),
        'echo-b',
        -Math.PI * 0.67,
        0.9,
      ),
    ],
    [quality.armDustCount],
  )

  return (
    <group>
      <group position={[0.55, -0.2, -1.2]}>
        <mesh scale={[2.5, 1.3, 0.42]}>
          <sphereGeometry args={[1, 40, 24]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={SCENE_COLORS.coreGlow}
            depthWrite={false}
            opacity={0.15}
            toneMapped={false}
            transparent
          />
        </mesh>
        {[1.5, 2.05, 2.65].map((radius, index) => (
          <mesh key={radius} rotation={[0, 0, index * 0.32]} scale={[1, 0.48, 1]}>
            <ringGeometry args={[radius, radius + 0.035, 96]} />
            <meshBasicMaterial
              color={index === 1 ? SCENE_COLORS.streamCyan : SCENE_COLORS.streamViolet}
              opacity={0.2 - index * 0.035}
              side={DoubleSide}
              transparent
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {echoArms.map((points, index) => (
        <Line
          key={index}
          points={points.map((point) => [point.x, point.y, point.z])}
          color={index === 0 ? SCENE_COLORS.streamViolet : SCENE_COLORS.streamCyan}
          lineWidth={1.4}
          opacity={0.18}
          transparent
        />
      ))}

      <Line
        points={mainPath.map((point) => [point.x, point.y, point.z])}
        color={SCENE_COLORS.streamGlow}
        lineWidth={GALAXY_VISUAL_CONFIG.streamGlowWidth}
        opacity={0.14}
        transparent
      />
      <Line
        points={mainPath.map((point) => [point.x, point.y, point.z + 0.02])}
        color={SCENE_COLORS.streamBright}
        lineWidth={GALAXY_VISUAL_CONFIG.streamCoreWidth}
        opacity={0.86}
        transparent
      />

      {HISTORICAL_ERAS.filter((era) => era.id !== 'unknown').map(
        (era, index) => {
          const startYear = era.minimumYear ?? -650
          const endYear = era.maximumYear ?? 2_025
          const segment = sampleHistoricalCurve(
            historicalPathProgress(startYear),
            historicalPathProgress(endYear),
            24,
          )

          return (
            <Line
              key={era.id}
              points={segment.map((point) => [point.x, point.y, point.z + 0.05])}
              color={index % 2 === 0 ? SCENE_COLORS.streamCyan : SCENE_COLORS.streamViolet}
              lineWidth={2.2}
              opacity={0.52}
              transparent
            />
          )
        },
      )}

      {dustFields.map((positions, index) => (
        <points key={index}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            blending={AdditiveBlending}
            color={index === 1 ? SCENE_COLORS.streamViolet : SCENE_COLORS.streamCyan}
            depthWrite={false}
            opacity={index === 0 ? 0.36 : 0.18}
            size={index === 0 ? 0.072 : 0.054}
            sizeAttenuation
            toneMapped={false}
            transparent
          />
        </points>
      ))}

      {ERA_PROGRESS.map((era, index) => {
        const point = historicalCurvePoint(historicalPathProgress(era.year))
        return (
          <Html
            key={era.align}
            center
            position={[point.x, point.y + 0.58 + (index % 2) * 0.16, point.z]}
            style={{ pointerEvents: 'none' }}
          >
            <span className="galaxy-era-label">{era.label}</span>
          </Html>
        )
      })}
    </group>
  )
}
