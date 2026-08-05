import { Canvas } from '@react-three/fiber'
import { Component, useState, type ReactNode } from 'react'

import { HistoricalGalaxyScene } from '@/features/galaxy/scene/historical-galaxy-scene'
import type {
  GalaxyPhilosopherNode,
  GalaxyIdeaSystem,
  GalaxyTelemetry,
} from '@/features/galaxy/types/galaxy'
import { useExperienceStore } from '@/stores/experience-store'

export interface GalaxyCanvasProps {
  active: boolean
  nodes: GalaxyPhilosopherNode[]
  selectedPhilosopherId: string | null
  selectedIdeaId: string | null
  ideaSystem: GalaxyIdeaSystem
  onSelect: (id: string) => void
  onSelectIdea: (id: string) => void
  onSelectRelatedIdea: (philosopherId: string, ideaId: string) => void
  onTelemetry: (telemetry: GalaxyTelemetry) => void
  reducedMotion: boolean
}

interface SceneBoundaryProps {
  children: ReactNode
}

interface SceneBoundaryState {
  hasError: boolean
}

class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { hasError: false }

  static getDerivedStateFromError(): SceneBoundaryState {
    return { hasError: true }
  }

  componentDidCatch() {
    // The DOM explorer remains available outside this isolated scene boundary.
  }

  render() {
    return this.state.hasError ? <SceneFallback /> : this.props.children
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGL2RenderingContext && canvas.getContext('webgl2'))
  } catch {
    return false
  }
}

export function SceneFallback() {
  return (
    <div
      className="grid h-full place-items-center px-6 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-sm rounded-2xl border border-border/70 bg-background/75 p-5 backdrop-blur-md">
        <p className="text-sm font-medium text-foreground">
          The historical scene is unavailable.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use the “Explore accessible list” control to browse and select every
          philosopher without WebGL.
        </p>
      </div>
    </div>
  )
}

export function GalaxyCanvas({
  active,
  nodes,
  selectedPhilosopherId,
  selectedIdeaId,
  ideaSystem,
  onSelect,
  onSelectIdea,
  onSelectRelatedIdea,
  onTelemetry,
  reducedMotion,
}: GalaxyCanvasProps) {
  const [isWebGLAvailable] = useState(supportsWebGL)
  const eraGuidesVisible = useExperienceStore(
    (state) => state.eraGuidesVisible,
  )
  const labelsVisible = useExperienceStore((state) => state.labelsVisible)
  const cameraResetRequest = useExperienceStore(
    (state) => state.cameraResetRequest,
  )
  const connectionsVisible = useExperienceStore(
    (state) => state.connectionsVisible,
  )
  const backgroundMotionEnabled = useExperienceStore(
    (state) => state.backgroundMotionEnabled,
  )

  if (!isWebGLAvailable) {
    return <SceneFallback />
  }

  return (
    <SceneBoundary>
      <Canvas
        aria-label="An interactive galaxy positioning philosophers from ancient to contemporary history"
        className={
          active ? 'galaxy-canvas galaxy-canvas--active' : 'galaxy-canvas'
        }
        role="img"
        style={{ touchAction: 'none' }}
        camera={{ fov: 42, near: 0.1, far: 220, position: [0, 0, 20] }}
        dpr={[1, 1.5]}
        fallback={<SceneFallback />}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        onPointerMissed={() => {
          useExperienceStore.getState().setHoveredPhilosopherId(null)
        }}
      >
        <HistoricalGalaxyScene
          active={active}
          nodes={nodes}
          selectedPhilosopherId={selectedPhilosopherId}
          selectedIdeaId={selectedIdeaId}
          ideaSystem={ideaSystem}
          onSelect={onSelect}
          onSelectIdea={onSelectIdea}
          onSelectRelatedIdea={onSelectRelatedIdea}
          onTelemetry={onTelemetry}
          reducedMotion={reducedMotion}
          eraGuidesVisible={eraGuidesVisible}
          labelsVisible={labelsVisible}
          cameraResetRequest={cameraResetRequest}
          connectionsVisible={connectionsVisible}
          backgroundMotionEnabled={backgroundMotionEnabled}
        />
      </Canvas>
    </SceneBoundary>
  )
}
