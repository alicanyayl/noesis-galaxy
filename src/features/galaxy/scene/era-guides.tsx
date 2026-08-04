import { Html } from '@react-three/drei'
import { DoubleSide } from 'three'

import {
  ERA_BOUNDARY_YEARS,
  HISTORICAL_ERAS,
  getEraGuideX,
} from '@/features/galaxy/layout/eras'
import type { GalaxyBounds } from '@/features/galaxy/layout/galaxy-bounds'
import { mapHistoricalYearToX } from '@/features/galaxy/layout/historical-axis'
import type { GalaxyPhilosopherNode } from '@/features/galaxy/types/galaxy'
import {
  GUIDE_VISUAL_CONFIG,
  SCENE_COLORS,
} from '@/features/galaxy/scene/scene-visuals'

interface EraGuidesProps {
  bounds: GalaxyBounds
  selectedNode: GalaxyPhilosopherNode | null
}

function readableYear(node: GalaxyPhilosopherNode) {
  const year = node.philosopher.birthYear.numeric

  if (year === null) return 'Unknown year'
  if (year < 0) return `${Math.abs(year)} BCE`
  return `${year} CE`
}

export function EraGuides({ bounds, selectedNode }: EraGuidesProps) {
  const minX = bounds.min.x - 0.65
  const maxX = bounds.max.x + 0.65
  const guideY = bounds.min.y + 1.05
  const guideZ = bounds.min.z - 0.9
  const boundaryXs = ERA_BOUNDARY_YEARS.map(mapHistoricalYearToX).filter(
    (x) => x > minX && x < maxX,
  )
  const regionEdges = [minX, ...boundaryXs, maxX]
  const visibleEras = HISTORICAL_ERAS.filter(
    (era) => era.id !== 'unknown' && getEraGuideX(era) <= maxX,
  )

  return (
    <group>
      {regionEdges.slice(0, -1).map((start, index) => {
        const end = regionEdges[index + 1]
        const era = visibleEras[index]

        if (!era) return null

        return (
          <mesh
            key={era.id}
            position={[
              (start + end) / 2,
              bounds.center.y,
              guideZ - 0.35,
            ]}
          >
            <planeGeometry args={[end - start, bounds.size.y + 2.2]} />
            <meshBasicMaterial
              color={era.color}
              opacity={GUIDE_VISUAL_CONFIG.regionOpacity}
              side={DoubleSide}
              transparent
              depthWrite={false}
            />
          </mesh>
        )
      })}

      <mesh position={[(minX + maxX) / 2, guideY, guideZ]}>
        <boxGeometry
          args={[
            maxX - minX,
            GUIDE_VISUAL_CONFIG.spineThickness,
            GUIDE_VISUAL_CONFIG.spineThickness,
          ]}
        />
        <meshBasicMaterial
          color={SCENE_COLORS.structuralBright}
          opacity={0.62}
          transparent
        />
      </mesh>

      {boundaryXs.map((x) => (
        <mesh key={x} position={[x, bounds.center.y, guideZ]}>
          <boxGeometry
            args={[
              GUIDE_VISUAL_CONFIG.boundaryThickness,
              bounds.size.y + 1.6,
              GUIDE_VISUAL_CONFIG.boundaryThickness,
            ]}
          />
          <meshBasicMaterial
            color={SCENE_COLORS.structural}
            opacity={0.3}
            transparent
          />
        </mesh>
      ))}

      {visibleEras.map((era, index) => (
        <Html
          key={era.id}
          center
          position={[
            getEraGuideX(era),
            guideY - 0.42 - (index % 2) * 0.22,
            guideZ,
          ]}
          style={{ pointerEvents: 'none' }}
        >
          <span className="galaxy-era-label">{era.label}</span>
        </Html>
      ))}

      <Html
        position={[minX, guideY + 0.2, guideZ]}
        style={{ pointerEvents: 'none' }}
      >
        <span className="galaxy-axis-end galaxy-axis-end--start">
          BCE · Antiquity
        </span>
      </Html>
      <Html
        position={[maxX, guideY + 0.2, guideZ]}
        style={{ pointerEvents: 'none' }}
      >
        <span className="galaxy-axis-end galaxy-axis-end--end">
          Present · CE
        </span>
      </Html>

      {selectedNode ? (
        <group>
          <mesh
            position={[
              selectedNode.position.x,
              (selectedNode.position.y + guideY) / 2,
              selectedNode.position.z - 0.06,
            ]}
          >
            <boxGeometry
              args={[
                0.025,
                Math.abs(selectedNode.position.y - guideY),
                0.025,
              ]}
            />
            <meshBasicMaterial
              color={SCENE_COLORS.selected}
              opacity={0.72}
              transparent
            />
          </mesh>
          <Html
            center
            position={[selectedNode.position.x, guideY - 0.12, guideZ + 0.1]}
            style={{ pointerEvents: 'none' }}
          >
            <span className="galaxy-selected-year">
              {readableYear(selectedNode)}
            </span>
          </Html>
        </group>
      ) : null}
    </group>
  )
}
