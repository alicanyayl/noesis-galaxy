import { useThree } from '@react-three/fiber'
import { useCallback, useMemo } from 'react'

import { calculateGalaxyBounds } from '@/features/galaxy/layout/galaxy-bounds'
import { createIdeaFocusPosition } from '@/features/galaxy/layout/idea-orbit'
import { RELATION_EDGE_BUDGETS } from '@/features/galaxy/layout/relationship-budgets'
import {
  calculateOverviewCamera,
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
import { SupernovaLandmarks } from '@/features/galaxy/scene/supernova-landmarks'
import type { GalaxyCameraState } from '@/features/galaxy/layout/camera-modes'
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
  backgroundMotionEnabled: boolean
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
  backgroundMotionEnabled,
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
    return createIdeaFocusPosition(selectedNode.position)
  }, [ideaSystem.selectedIdea, selectedNode])
  const focusMode = selectedIdeaPosition
    ? 'idea'
    : selectedNode
      ? 'philosopher'
      : 'galaxy'
  const handleCameraSettled = useCallback(
    (camera: GalaxyCameraState, overviewReady: boolean) => {
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
        cameraDistance: camera.distance,
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
        cameraMode: camera.mode,
        cameraTarget: camera.target,
        cameraMinDistance: camera.minDistance,
        cameraMaxDistance: camera.maxDistance,
        dollyToCursor: false,
        distantStarCount: quality.distantStarCount,
        midStarCount: quality.midStarCount,
        foregroundDustCount: quality.foregroundDustCount,
        backgroundStarCount:
          quality.distantStarCount +
          quality.midStarCount +
          quality.foregroundDustCount,
        supernovaCount: quality.supernovaCount,
        orbitingIdeaCount: ideaSystem.selectedIdea
          ? 0
          : Math.min(
              ideaSystem.ideas.length,
              RELATION_EDGE_BUDGETS.philosopherIdeaEdges,
              quality.visibleIdeaOrbitLimit,
            ),
        orbitMotionEnabled:
          Boolean(selectedNode) &&
          !ideaSystem.selectedIdea &&
          backgroundMotionEnabled &&
          !reducedMotion,
        relationEdgeBudget:
          ideaSystem.agreeingIdeas.length + ideaSystem.disagreeingIdeas.length,
        interactionTarget,
      })
    },
    [
      bounds.max.x,
      bounds.min.x,
      nodes,
      onTelemetry,
      perspectiveCamera,
      quality.distantStarCount,
      quality.midStarCount,
      quality.foregroundDustCount,
      quality.supernovaCount,
      quality.visibleIdeaOrbitLimit,
      selectedNode,
      selectedPhilosopherId,
      selectedIdeaId,
      ideaSystem,
      renderer,
      focusMode,
      viewport.height,
      viewport.width,
      backgroundMotionEnabled,
      reducedMotion,
    ],
  )

  return (
    <>
      <GalaxyEnvironment
        active={active}
        bounds={bounds}
        camera={overviewCamera}
        motionEnabled={backgroundMotionEnabled}
        quality={quality}
        reducedMotion={reducedMotion}
      />
      <ambientLight color="#50647f" intensity={0.2} />
      <directionalLight
        color="#d9e8f6"
        intensity={1.45}
        position={[-6, 8, 10]}
      />
      <pointLight
        color="#a8c8ed"
        decay={1.8}
        distance={26}
        intensity={18}
        position={[0, 0.5, 4.5]}
      />
      {!selectedNode ? (
        <SupernovaLandmarks
          bounds={bounds}
          motionEnabled={backgroundMotionEnabled}
          quality={quality}
          reducedMotion={reducedMotion}
        />
      ) : null}
      {eraGuidesVisible ? (
        <HistoricalStreams focused={selectedNode !== null} quality={quality} />
      ) : null}
      {labelsVisible ? <SchoolLabels nodes={nodes} quality={quality} /> : null}
      <PhilosopherNodes
        ideaFocusActive={selectedIdeaPosition !== null}
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
          motionEnabled={backgroundMotionEnabled}
          nodes={nodes}
          onSelectIdea={onSelectIdea}
          onSelectRelatedIdea={onSelectRelatedIdea}
          reducedMotion={reducedMotion}
          visibleIdeaOrbitLimit={quality.visibleIdeaOrbitLimit}
        />
      ) : null}
      <CameraRig
        bounds={bounds}
        mode={
          selectedIdeaPosition
            ? 'idea-focus'
            : selectedNode
              ? 'philosopher-focus'
              : 'galaxy-overview'
        }
        philosopherFocus={selectedNode?.position ?? null}
        ideaFocus={selectedIdeaPosition}
        quality={quality}
        reducedMotion={reducedMotion}
        resetRequest={cameraResetRequest}
        transitionIdentity={`${focusMode}:${selectedPhilosopherId ?? 'none'}:${selectedIdeaId ?? 'none'}:${nodes.length}`}
        onCameraSettled={handleCameraSettled}
      />
    </>
  )
}
