import type { KeyIdea, PhilosopherSummary } from '@/api/philosophers'
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
  pathProgress: number
}

export type IdeaRelationKind = 'owner' | 'agreement' | 'disagreement'

export interface GalaxyIdeaNode {
  idea: KeyIdea
  position: GalaxyPosition
  relation: IdeaRelationKind
}

export interface GalaxyIdeaSystem {
  ideas: KeyIdea[]
  totalIdeaCount: number
  selectedIdea: KeyIdea | null
  agreeingIdeas: KeyIdea[]
  disagreeingIdeas: KeyIdea[]
  isLoading: boolean
}

export interface GalaxyTelemetry {
  philosopherCount: number
  visibleNodeCount: number
  historicalMinX: number
  historicalMaxX: number
  cameraDistance: number
  overviewReady: boolean
  selectedPhilosopherId: string | null
  selectedIdeaId: string | null
  ideaNodeCount: number
  agreementEdgeCount: number
  disagreementEdgeCount: number
  drawCalls: number
  focusMode: 'galaxy' | 'philosopher' | 'idea'
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
