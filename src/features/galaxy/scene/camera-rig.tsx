import {
  CameraControls,
  type CameraControls as CameraControlsInstance,
} from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type { PerspectiveCamera } from 'three'

import type { GalaxyBounds } from '@/features/galaxy/layout/galaxy-bounds'
import {
  calculateOverviewCamera,
  type OverviewCamera,
} from '@/features/galaxy/layout/overview-camera'
import type { SceneQuality } from '@/features/galaxy/scene/scene-quality'
import type { GalaxyPosition } from '@/features/galaxy/types/galaxy'

interface CameraRigProps {
  bounds: GalaxyBounds
  focus: GalaxyPosition | null
  quality: SceneQuality
  reducedMotion: boolean
  resetRequest: number
  onCameraSettled: (camera: OverviewCamera, overviewReady: boolean) => void
}

export function CameraRig({
  bounds,
  focus,
  quality,
  reducedMotion,
  resetRequest,
  onCameraSettled,
}: CameraRigProps) {
  const controlsRef = useRef<CameraControlsInstance>(null)
  const transitionRequestRef = useRef(0)
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

  useEffect(() => {
    const controls = controlsRef.current

    if (!controls) {
      return
    }

    const transitionRequest = transitionRequestRef.current + 1
    transitionRequestRef.current = transitionRequest

    if (focus) {
      const targetY = focus.y + quality.selectedTargetOffsetY
      void controls
        .setLookAt(
          focus.x,
          targetY,
          focus.z + quality.selectionDistance,
          focus.x,
          targetY,
          focus.z,
          !reducedMotion,
        )
        .then(() => {
          if (transitionRequestRef.current === transitionRequest) {
            onCameraSettled(overviewCamera, false)
          }
        })
        .catch(() => undefined)
      return
    }

    void controls
      .setLookAt(
        overviewCamera.position.x,
        overviewCamera.position.y,
        overviewCamera.position.z,
        overviewCamera.target.x,
        overviewCamera.target.y,
        overviewCamera.target.z,
        !reducedMotion,
      )
      .then(() => {
        if (transitionRequestRef.current === transitionRequest) {
          onCameraSettled(overviewCamera, true)
        }
      })
      .catch(() => undefined)
  }, [
    focus,
    onCameraSettled,
    overviewCamera,
    quality.selectedTargetOffsetY,
    quality.selectionDistance,
    reducedMotion,
    resetRequest,
  ])

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      maxDistance={overviewCamera.maxDistance}
      minDistance={overviewCamera.minDistance}
      minPolarAngle={Math.PI * 0.22}
      maxPolarAngle={Math.PI * 0.78}
      smoothTime={reducedMotion ? 0.01 : 0.48}
      draggingSmoothTime={reducedMotion ? 0.01 : 0.12}
      dollyToCursor
    />
  )
}
