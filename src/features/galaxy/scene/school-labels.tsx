import { Html } from '@react-three/drei'
import { useMemo } from 'react'

import type { GalaxyPhilosopherNode } from '@/features/galaxy/types/galaxy'

interface SchoolLabelsProps {
  nodes: GalaxyPhilosopherNode[]
}

interface SchoolAggregate {
  key: string
  label: string
  count: number
  x: number
  y: number
  z: number
}

export function SchoolLabels({ nodes }: SchoolLabelsProps) {
  const labels = useMemo(() => {
    const aggregates = new Map<string, SchoolAggregate>()

    for (const node of nodes) {
      const current = aggregates.get(node.schoolKey)

      if (current) {
        current.count += 1
        current.x += node.position.x
        current.y += node.position.y
        current.z += node.position.z
      } else {
        aggregates.set(node.schoolKey, {
          key: node.schoolKey,
          label: node.schoolLabel,
          count: 1,
          x: node.position.x,
          y: node.position.y,
          z: node.position.z,
        })
      }
    }

    return [...aggregates.values()]
      .filter((aggregate) => aggregate.count >= 4)
      .sort((first, second) => second.count - first.count)
      .slice(0, 5)
      .map((aggregate) => ({
        ...aggregate,
        x: aggregate.x / aggregate.count,
        y: aggregate.y / aggregate.count,
        z: aggregate.z / aggregate.count,
      }))
  }, [nodes])

  return labels.map((label) => (
    <Html
      key={label.key}
      center
      position={[label.x, label.y + 0.78, label.z]}
      distanceFactor={20}
      style={{ pointerEvents: 'none' }}
    >
      <span className="whitespace-nowrap rounded-full border border-white/10 bg-[#090b16]/65 px-2 py-1 text-[9px] font-medium tracking-[0.08em] text-white/55 backdrop-blur-sm">
        {label.label} · {label.count}
      </span>
    </Html>
  ))
}
