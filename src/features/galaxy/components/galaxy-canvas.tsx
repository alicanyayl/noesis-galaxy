import { Canvas } from '@react-three/fiber'
import { Component, useState, type ReactNode } from 'react'

import { GalaxyScene } from '@/features/galaxy/scene/galaxy-scene'

interface GalaxyCanvasProps {
  isActive: boolean
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
    // The visible fallback below is intentionally free of implementation details.
  }

  render() {
    if (this.state.hasError) {
      return <SceneFallback />
    }

    return this.props.children
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

function SceneFallback() {
  return (
    <div
      className="grid h-full place-items-center px-6 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-sm">
        <p className="text-sm font-medium text-foreground">
          The visual preview is unavailable.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Noesis Galaxy still works as a readable experience, but this device
          could not start the WebGL scene.
        </p>
      </div>
    </div>
  )
}

export function GalaxyCanvas({
  isActive,
  reducedMotion,
}: GalaxyCanvasProps) {
  const [isWebGLAvailable] = useState(supportsWebGL)

  if (!isWebGLAvailable) {
    return <SceneFallback />
  }

  return (
    <SceneBoundary>
      <Canvas
        aria-label="A quiet field of stars surrounding a celestial placeholder"
        className={
          isActive ? 'galaxy-canvas galaxy-canvas--active' : 'galaxy-canvas'
        }
        role="img"
        camera={{ fov: 44, near: 0.1, far: 100, position: [0, 0, 6] }}
        dpr={[1, 1.5]}
        fallback={<SceneFallback />}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <GalaxyScene isActive={isActive} reducedMotion={reducedMotion} />
      </Canvas>
    </SceneBoundary>
  )
}
