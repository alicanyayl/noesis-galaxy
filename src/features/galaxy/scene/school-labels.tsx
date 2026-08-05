import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'

import type { SceneQuality } from '@/features/galaxy/scene/scene-quality'
import {
  GALAXY_VISUAL_CONFIG,
  SCENE_COLORS,
} from '@/features/galaxy/scene/scene-visuals'
import type { GalaxyPhilosopherNode } from '@/features/galaxy/types/galaxy'

interface SchoolLabelsProps {
  nodes: GalaxyPhilosopherNode[]
  quality: SceneQuality
}

interface SchoolAggregate {
  key: string
  label: string
  count: number
  minX: number
  maxX: number
  minY: number
  maxY: number
  x: number
  y: number
  z: number
}

export function SchoolLabels({ nodes, quality }: SchoolLabelsProps) {
  const labels = useMemo(() => {
    const aggregates = new Map<string, SchoolAggregate>()

    for (const node of nodes) {
      const current = aggregates.get(node.schoolKey)

      if (current) {
        current.count += 1
        current.minX = Math.min(current.minX, node.position.x)
        current.maxX = Math.max(current.maxX, node.position.x)
        current.minY = Math.min(current.minY, node.position.y)
        current.maxY = Math.max(current.maxY, node.position.y)
        current.x += node.position.x
        current.y += node.position.y
        current.z += node.position.z
      } else {
        aggregates.set(node.schoolKey, {
          key: node.schoolKey,
          label: node.schoolLabel,
          count: 1,
          minX: node.position.x,
          maxX: node.position.x,
          minY: node.position.y,
          maxY: node.position.y,
          x: node.position.x,
          y: node.position.y,
          z: node.position.z,
        })
      }
    }

    return [...aggregates.values()]
      .filter((aggregate) => aggregate.count >= 4)
      .sort(
        (first, second) =>
          second.count - first.count || first.label.localeCompare(second.label),
      )
      .slice(0, quality.visibleSchoolLabelLimit)
      .map((aggregate) => ({
        ...aggregate,
        x: aggregate.x / aggregate.count,
        y: aggregate.y / aggregate.count,
        z: aggregate.z / aggregate.count,
        radiusX: Math.min(
          Math.max((aggregate.maxX - aggregate.minX) / 2 + 0.55, 0.9),
          2.6,
        ),
        radiusY: Math.min(
          Math.max((aggregate.maxY - aggregate.minY) / 2 + 0.42, 0.62),
          1.15,
        ),
      }))
  }, [nodes, quality.visibleSchoolLabelLimit])

  return labels.map((label, index) => (
    <group key={label.key}>
      <Line
        points={Array.from({ length: 18 }, (_, pointIndex) => {
          const angle = -Math.PI * 0.82 + (pointIndex / 17) * Math.PI * 1.18
          return [
            label.x + Math.cos(angle) * label.radiusX,
            label.y + Math.sin(angle) * label.radiusY,
            label.z - 0.34 + Math.sin(angle * 2) * 0.08,
          ] as [number, number, number]
        })}
        color={SCENE_COLORS.structuralBright}
        lineWidth={GALAXY_VISUAL_CONFIG.schoolArcWidth}
        opacity={0.2}
        transparent
      />
      <Html
        center
        position={[
          label.x,
          label.y + label.radiusY + 0.2 + (index % 2) * 0.12,
          label.z,
        ]}
        style={{ pointerEvents: 'none' }}
      >
        <span className="galaxy-school-label">
          {label.label}
        </span>
      </Html>
    </group>
  ))
}
