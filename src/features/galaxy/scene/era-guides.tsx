import { Html } from '@react-three/drei'

import {
  ERA_BOUNDARY_YEARS,
  HISTORICAL_ERAS,
  getEraGuideX,
} from '@/features/galaxy/layout/eras'
import { mapHistoricalYearToX } from '@/features/galaxy/layout/historical-axis'

const GUIDE_HEIGHT = 10.5

export function EraGuides() {
  return (
    <group position={[0, 0, -2.2]}>
      <mesh position={[2.5, -5.1, 0]}>
        <boxGeometry args={[28, 0.012, 0.012]} />
        <meshBasicMaterial color="#66708d" opacity={0.4} transparent />
      </mesh>

      {ERA_BOUNDARY_YEARS.map((year) => (
        <mesh key={year} position={[mapHistoricalYearToX(year), 0, 0]}>
          <boxGeometry args={[0.012, GUIDE_HEIGHT, 0.012]} />
          <meshBasicMaterial color="#6e7590" opacity={0.22} transparent />
        </mesh>
      ))}

      {HISTORICAL_ERAS.map((era) => (
        <Html
          key={era.id}
          center
          position={[getEraGuideX(era), -5.5, 0]}
          distanceFactor={24}
          style={{ pointerEvents: 'none' }}
        >
          <span className="whitespace-nowrap rounded-full border border-white/10 bg-black/35 px-2 py-1 text-[9px] font-medium tracking-[0.12em] text-white/60 uppercase backdrop-blur-sm">
            {era.label}
          </span>
        </Html>
      ))}
    </group>
  )
}
