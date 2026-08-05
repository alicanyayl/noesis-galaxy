import {
  CameraControls,
  type CameraControls as CameraControlsInstance,
} from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Vector3, type PerspectiveCamera } from 'three'

import type { GalaxyBounds } from '@/features/galaxy/layout/galaxy-bounds'
import {
  createGalaxyCameraState,
  CAMERA_CONTROL_CONFIG,
  type GalaxyCameraState,
} from '@/features/galaxy/layout/camera-modes'
import { calculateOverviewCamera } from '@/features/galaxy/layout/overview-camera'
import type { SceneQuality } from '@/features/galaxy/scene/scene-quality'
import type { CameraMode, GalaxyPosition } from '@/features/galaxy/types/galaxy'

interface CameraRigProps {
  bounds: GalaxyBounds
  mode: CameraMode
  philosopherFocus: GalaxyPosition | null
  ideaFocus: GalaxyPosition | null
  quality: SceneQuality
  reducedMotion: boolean
  resetRequest: number
  transitionIdentity: string
  onCameraSettled: (camera: GalaxyCameraState, overviewReady: boolean) => void
}

export function CameraRig({
  bounds,
  mode,
  philosopherFocus,
  ideaFocus,
  quality,
  reducedMotion,
  resetRequest,
  transitionIdentity,
  onCameraSettled,
}: CameraRigProps) {
  const controlsRef = useRef<CameraControlsInstance>(null)
  const transitionRequestRef = useRef(0)
  const onCameraSettledRef = useRef(onCameraSettled)
  const cameraStateRef = useRef<GalaxyCameraState | null>(null)
  const telemetryTargetRef = useRef(new Vector3())
  const size = useThree((state) => state.size)
  const verticalFov = useThree(
    (state) => (state.camera as PerspectiveCamera).fov,
  )
  const overviewCamera = useMemo(
    () =>
      calculateOverviewCamera(
        bounds,
        { width: size.width, height: size.height },
        quality.overviewPadding,
        verticalFov,
      ),
    [bounds, quality.overviewPadding, size.height, size.width, verticalFov],
  )
  const cameraState = useMemo(
    () =>
      createGalaxyCameraState(
        mode,
        overviewCamera,
        quality,
        philosopherFocus,
        ideaFocus,
      ),
    [ideaFocus, mode, overviewCamera, philosopherFocus, quality],
  )
  useEffect(() => {
    cameraStateRef.current = cameraState
  }, [cameraState])

  useEffect(() => {
    onCameraSettledRef.current = onCameraSettled
  }, [onCameraSettled])

  const syncTestTelemetry = useCallback(() => {
    if (!(import.meta.env.DEV || import.meta.env.VITE_E2E === 'true')) return
    const controls = controlsRef.current
    const telemetry = window.__NOESIS_GALAXY_TELEMETRY__
    if (!controls || !telemetry) return
    controls.getTarget(telemetryTargetRef.current, false)
    telemetry.cameraTarget = {
      x: telemetryTargetRef.current.x,
      y: telemetryTargetRef.current.y,
      z: telemetryTargetRef.current.z,
    }
    telemetry.cameraDistance = controls.distance
  }, [])

  useEffect(() => {
    const controls = controlsRef.current
    const nextCameraState = cameraStateRef.current
    if (!controls || !nextCameraState) return

    const transitionRequest = transitionRequestRef.current + 1
    transitionRequestRef.current = transitionRequest

    void controls
      .setLookAt(
        nextCameraState.position.x,
        nextCameraState.position.y,
        nextCameraState.position.z,
        nextCameraState.target.x,
        nextCameraState.target.y,
        nextCameraState.target.z,
        !reducedMotion,
      )
      .then(() => {
        if (transitionRequestRef.current === transitionRequest) {
          onCameraSettledRef.current(
            nextCameraState,
            nextCameraState.mode === 'galaxy-overview',
          )
          syncTestTelemetry()
        }
      })
      .catch(() => undefined)
  }, [reducedMotion, resetRequest, syncTestTelemetry, transitionIdentity])

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      maxDistance={cameraState.maxDistance}
      minDistance={cameraState.minDistance}
      minPolarAngle={CAMERA_CONTROL_CONFIG.minPolarAngle}
      maxPolarAngle={CAMERA_CONTROL_CONFIG.maxPolarAngle}
      smoothTime={reducedMotion ? 0.01 : 0.22}
      draggingSmoothTime={reducedMotion ? 0.01 : 0.06}
      restThreshold={0.015}
      dollySpeed={CAMERA_CONTROL_CONFIG.dollySpeed}
      truckSpeed={CAMERA_CONTROL_CONFIG.truckSpeed}
      dollyToCursor={CAMERA_CONTROL_CONFIG.dollyToCursor}
      onUpdate={syncTestTelemetry}
      onRest={syncTestTelemetry}
    />
  )
}
