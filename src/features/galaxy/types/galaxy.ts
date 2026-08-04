import type { PhilosopherSummary } from '@/api/philosophers'
import type { HistoricalEra } from '@/features/galaxy/layout/eras'

export interface GalaxyPosition {
  x: number
  y: number
  z: number
}

export interface GalaxyPhilosopherNode {
  philosopher: PhilosopherSummary
  position: GalaxyPosition
  era: HistoricalEra
  color: string
  schoolKey: string
  schoolLabel: string
}
