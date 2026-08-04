import { useThree } from '@react-three/fiber'
import { useCallback, useMemo } from 'react'

import { calculateGalaxyBounds } from '@/features/galaxy/layout/galaxy-bounds'
import {
  calculateOverviewCamera,
  type OverviewCamera,
} from '@/features/galaxy/layout/overview-camera'
import { CameraRig } from '@/features/galaxy/scene/camera-rig'
import { GalaxyEnvironment } from '@/features/galaxy/scene/galaxy-environment'
import { HistoricalStreams } from '@/features/galaxy/scene/historical-streams'
import { IdeaSystemScene } from '@/features/galaxy/scene/idea-system'
import { PhilosopherNodes } from '@/features/galaxy/scene/philosopher-nodes'
import {
  getSceneQuality,
  type SceneQuality,
} from '@/features/galaxy/scene/scene-quality'
import { SchoolLabels } from '@/features/galaxy/scene/school-labels'
import type {
  GalaxyPhilosopherNode,
  GalaxyIdeaSystem,
  GalaxyTelemetry,
} from '@/features/galaxy/types/galaxy'
import { Vector3, type PerspectiveCamera } from 'three'

interface HistoricalGalaxySceneProps {
  active: boolean
  nodes: GalaxyPhilosopherNode[]
  selectedPhilosopherId: string | null
  onSelect: (id: string) => void
  onSelectIdea: (id: string) => void
  onSelectRelatedIdea: (philosopherId: string, ideaId: string) => void
  onTelemetry: (telemetry: GalaxyTelemetry) => void
  reducedMotion: boolean
  eraGuidesVisible: boolean
  labelsVisible: boolean
  cameraResetRequest: number
  ideaSystem: GalaxyIdeaSystem
  connectionsVisible: boolean
  selectedIdeaId: string | null
}

export function HistoricalGalaxyScene({
  active,
  nodes,
  selectedPhilosopherId,
  onSelect,
  onSelectIdea,
  onSelectRelatedIdea,
  onTelemetry,
  reducedMotion,
  eraGuidesVisible,
  labelsVisible,
  cameraResetRequest,
  ideaSystem,
  connectionsVisible,
  selectedIdeaId,
}: HistoricalGalaxySceneProps) {
  const viewport = useThree((state) => state.size)
  const perspectiveCamera = useThree(
    (state) => state.camera,
  ) as PerspectiveCamera
  const renderer = useThree((state) => state.gl)
  const quality: SceneQuality = useMemo(
    () => getSceneQuality(viewport),
    [viewport],
  )
  const bounds = useMemo(
    () => calculateGalaxyBounds(nodes.map((node) => node.position)),
    [nodes],
  )
  const overviewCamera = useMemo(
    () =>
      calculateOverviewCamera(
        bounds,
        viewport,
        quality.overviewPadding,
        perspectiveCamera.fov,
      ),
    [bounds, perspectiveCamera.fov, quality.overviewPadding, viewport],
  )
  const selectedNode = useMemo(
    () =>
      nodes.find(
        (node) => node.philosopher.id === selectedPhilosopherId,
      ) ?? null,
    [nodes, selectedPhilosopherId],
  )
  const selectedIdeaPosition = useMemo(() => {
    if (!selectedNode || !ideaSystem.selectedIdea) return null

    const count = Math.max(ideaSystem.ideas.length, 1)
    const index = ideaSystem.ideas.findIndex(
      (idea) => idea.id === ideaSystem.selectedIdea?.id,
    )
    if (index < 0) return null
    const angle = -Math.PI / 2 + (index / count) * Math.PI * 2
    const radius = 1.4 + (index % 2) * 0.34

    return {
      x: selectedNode.position.x + Math.cos(angle) * radius,
      y: selectedNode.position.y + Math.sin(angle) * radius * 0.68,
      z: selectedNode.position.z + 0.24 + Math.sin(angle * 2) * 0.18,
    }
  }, [ideaSystem.ideas, ideaSystem.selectedIdea, selectedNode])
  const focusMode = selectedIdeaPosition
    ? 'idea'
    : selectedNode
      ? 'philosopher'
      : 'galaxy'
  const handleCameraSettled = useCallback(
    (camera: OverviewCamera, overviewReady: boolean) => {
      const interactionTarget =
        (import.meta.env.DEV || import.meta.env.VITE_E2E === 'true') &&
        overviewReady
        ? nodes
            .map((node) => {
              const projected = new Vector3(
                node.position.x,
                node.position.y,
                node.position.z,
              ).project(perspectiveCamera)
              return {
                philosopherId: node.philosopher.id,
                screenX: ((projected.x + 1) / 2) * viewport.width,
                screenY: ((1 - projected.y) / 2) * viewport.height,
              }
            })
            .find(
              (target) =>
                target.screenX > viewport.width * 0.38 &&
                target.screenX < viewport.width * 0.78 &&
                target.screenY > viewport.height * 0.4 &&
                target.screenY < viewport.height * 0.74,
            )
        : undefined

      onTelemetry({
        philosopherCount: nodes.length,
        visibleNodeCount: nodes.length,
        historicalMinX: bounds.min.x,
        historicalMaxX: bounds.max.x,
        cameraDistance: selectedIdeaPosition
          ? quality.ideaSelectionDistance
          : selectedNode
            ? quality.selectionDistance
            : camera.distance,
        overviewReady,
        selectedPhilosopherId,
        selectedIdeaId,
        ideaNodeCount:
          ideaSystem.ideas.length +
          ideaSystem.agreeingIdeas.length +
          ideaSystem.disagreeingIdeas.length,
        agreementEdgeCount: ideaSystem.agreeingIdeas.length,
        disagreementEdgeCount: ideaSystem.disagreeingIdeas.length,
        drawCalls: renderer.info.render.calls,
        focusMode,
        interactionTarget,
      })
    },
    [
      bounds.max.x,
      bounds.min.x,
      nodes,
      onTelemetry,
      perspectiveCamera,
      quality.selectionDistance,
      quality.ideaSelectionDistance,
      selectedIdeaPosition,
      selectedNode,
      selectedPhilosopherId,
      selectedIdeaId,
      ideaSystem,
      renderer,
      focusMode,
      viewport.height,
      viewport.width,
    ],
  )

  return (
    <>
      <GalaxyEnvironment
        active={active}
        bounds={bounds}
        camera={overviewCamera}
        quality={quality}
      />
      {eraGuidesVisible ? <HistoricalStreams quality={quality} /> : null}
      {labelsVisible ? <SchoolLabels nodes={nodes} quality={quality} /> : null}
      <PhilosopherNodes
        nodes={nodes}
        quality={quality}
        selectedPhilosopherId={selectedPhilosopherId}
        onSelect={onSelect}
      />
      {selectedNode && ideaSystem.ideas.length > 0 ? (
        <IdeaSystemScene
          center={selectedNode.position}
          connectionsVisible={connectionsVisible}
          ideaSystem={ideaSystem}
          nodes={nodes}
          onSelectIdea={onSelectIdea}
          onSelectRelatedIdea={onSelectRelatedIdea}
          reducedMotion={reducedMotion}
        />
      ) : null}
      <CameraRig
        bounds={bounds}
        focus={selectedIdeaPosition ?? selectedNode?.position ?? null}
        focusDistance={
          selectedIdeaPosition ? quality.ideaSelectionDistance : undefined
        }
        quality={quality}
        reducedMotion={reducedMotion}
        resetRequest={cameraResetRequest}
        onCameraSettled={handleCameraSettled}
      />
    </>
  )
}
