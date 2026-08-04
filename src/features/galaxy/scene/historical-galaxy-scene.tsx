import { useThree } from '@react-three/fiber'
import { useCallback, useMemo } from 'react'

import { calculateGalaxyBounds } from '@/features/galaxy/layout/galaxy-bounds'
import {
  calculateOverviewCamera,
  type OverviewCamera,
} from '@/features/galaxy/layout/overview-camera'
import { CameraRig } from '@/features/galaxy/scene/camera-rig'
import { EraGuides } from '@/features/galaxy/scene/era-guides'
import { GalaxyEnvironment } from '@/features/galaxy/scene/galaxy-environment'
import { PhilosopherNodes } from '@/features/galaxy/scene/philosopher-nodes'
import {
  getSceneQuality,
  type SceneQuality,
} from '@/features/galaxy/scene/scene-quality'
import { SchoolLabels } from '@/features/galaxy/scene/school-labels'
import type {
  GalaxyPhilosopherNode,
  GalaxyTelemetry,
} from '@/features/galaxy/types/galaxy'
import { Vector3, type PerspectiveCamera } from 'three'

interface HistoricalGalaxySceneProps {
  active: boolean
  nodes: GalaxyPhilosopherNode[]
  selectedPhilosopherId: string | null
  onSelect: (id: string) => void
  onTelemetry: (telemetry: GalaxyTelemetry) => void
  reducedMotion: boolean
  eraGuidesVisible: boolean
  labelsVisible: boolean
  cameraResetRequest: number
}

export function HistoricalGalaxyScene({
  active,
  nodes,
  selectedPhilosopherId,
  onSelect,
  onTelemetry,
  reducedMotion,
  eraGuidesVisible,
  labelsVisible,
  cameraResetRequest,
}: HistoricalGalaxySceneProps) {
  const viewport = useThree((state) => state.size)
  const perspectiveCamera = useThree(
    (state) => state.camera,
  ) as PerspectiveCamera
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
        cameraDistance: selectedNode
          ? quality.selectionDistance
          : camera.distance,
        overviewReady,
        selectedPhilosopherId,
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
      selectedNode,
      selectedPhilosopherId,
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
      {eraGuidesVisible ? (
        <EraGuides bounds={bounds} selectedNode={selectedNode} />
      ) : null}
      {labelsVisible ? <SchoolLabels nodes={nodes} quality={quality} /> : null}
      <PhilosopherNodes
        nodes={nodes}
        quality={quality}
        selectedPhilosopherId={selectedPhilosopherId}
        onSelect={onSelect}
      />
      <CameraRig
        bounds={bounds}
        focus={selectedNode?.position ?? null}
        quality={quality}
        reducedMotion={reducedMotion}
        resetRequest={cameraResetRequest}
        onCameraSettled={handleCameraSettled}
      />
    </>
  )
}
