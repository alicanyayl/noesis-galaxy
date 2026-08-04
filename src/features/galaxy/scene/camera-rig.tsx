import {
  CameraControls,
  type CameraControls as CameraControlsInstance,
} from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

import type { GalaxyPosition } from '@/features/galaxy/types/galaxy'

const OVERVIEW_TARGET = [2.5, 0, 0] as const

interface CameraRigProps {
  focus: GalaxyPosition | null
  reducedMotion: boolean
  resetRequest: number
}

export function CameraRig({
  focus,
  reducedMotion,
  resetRequest,
}: CameraRigProps) {
  const controlsRef = useRef<CameraControlsInstance>(null)
  const aspect = useThree((state) => state.size.width / state.size.height)
  const overviewDistance = aspect < 0.7 ? 72 : aspect < 1.2 ? 44 : 32

  useEffect(() => {
    const controls = controlsRef.current

    if (!controls) {
      return
    }

    if (focus) {
      void controls
        .setLookAt(
          focus.x,
          focus.y + 0.25,
          focus.z + 5.6,
          focus.x,
          focus.y,
          focus.z,
          !reducedMotion,
        )
        .catch(() => undefined)
      return
    }

    void controls
      .setLookAt(
        0,
        0,
        overviewDistance,
        ...OVERVIEW_TARGET,
        !reducedMotion,
      )
      .catch(() => undefined)
  }, [focus, overviewDistance, reducedMotion, resetRequest])

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      maxDistance={90}
      minDistance={3.5}
      minPolarAngle={Math.PI * 0.2}
      maxPolarAngle={Math.PI * 0.8}
      smoothTime={reducedMotion ? 0.01 : 0.55}
      draggingSmoothTime={reducedMotion ? 0.01 : 0.12}
      dollyToCursor
    />
  )
}
