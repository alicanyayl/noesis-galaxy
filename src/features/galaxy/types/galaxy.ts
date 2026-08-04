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

export interface GalaxyTelemetry {
  philosopherCount: number
  visibleNodeCount: number
  historicalMinX: number
  historicalMaxX: number
  cameraDistance: number
  overviewReady: boolean
  selectedPhilosopherId: string | null
  interactionTarget?: {
    philosopherId: string
    screenX: number
    screenY: number
  }
}

declare global {
  interface Window {
    __NOESIS_GALAXY_TELEMETRY__?: GalaxyTelemetry
  }
}
