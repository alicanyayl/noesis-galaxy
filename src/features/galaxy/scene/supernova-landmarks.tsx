import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  DoubleSide,
  Object3D,
  type InstancedMesh,
  type MeshBasicMaterial,
} from 'three'

import type { GalaxyBounds } from '@/features/galaxy/layout/galaxy-bounds'
import {
  createSupernovaLandmarks,
  supernovaShellOpacityAtTime,
} from '@/features/galaxy/layout/supernova-landmarks'
import type { SceneQuality } from './scene-quality'
import { SCENE_COLORS, SUPERNOVA_VISUAL_CONFIG } from './scene-visuals'

interface SupernovaLandmarksProps {
  bounds: GalaxyBounds
  motionEnabled: boolean
  quality: SceneQuality
  reducedMotion: boolean
}

export function SupernovaLandmarks({
  bounds,
  motionEnabled,
  quality,
  reducedMotion,
}: SupernovaLandmarksProps) {
  const coreRef = useRef<InstancedMesh>(null)
  const shellRef = useRef<InstancedMesh>(null)
  const shellMaterialRef = useRef<MeshBasicMaterial>(null)
  const ringRef = useRef<InstancedMesh>(null)
  const landmarks = useMemo(
    () => createSupernovaLandmarks(bounds, quality.supernovaCount),
    [bounds, quality.supernovaCount],
  )
  const temporary = useMemo(() => new Object3D(), [])

  useLayoutEffect(() => {
    if (!coreRef.current || !shellRef.current || !ringRef.current) return

    landmarks.forEach((landmark, index) => {
      temporary.position.set(
        landmark.position.x,
        landmark.position.y,
        landmark.position.z,
      )
      temporary.rotation.set(0.48 + index * 0.14, 0.2, index * 0.72)
      temporary.scale.setScalar(landmark.scale * 0.78)
      temporary.updateMatrix()
      coreRef.current?.setMatrixAt(index, temporary.matrix)

      temporary.scale.setScalar(landmark.scale * 2.8)
      temporary.updateMatrix()
      shellRef.current?.setMatrixAt(index, temporary.matrix)

      temporary.scale.setScalar(landmark.scale * 0.82)
      temporary.updateMatrix()
      ringRef.current?.setMatrixAt(index, temporary.matrix)
    })

    for (const mesh of [coreRef.current, shellRef.current, ringRef.current]) {
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    }
  }, [landmarks, temporary])

  useFrame((state) => {
    const material = shellMaterialRef.current
    if (!material) return
    material.opacity = supernovaShellOpacityAtTime(
      state.clock.getElapsedTime(),
      motionEnabled,
      reducedMotion,
      0.055,
      SUPERNOVA_VISUAL_CONFIG.pulseSpeed * 0.42,
    )
  })

  if (landmarks.length === 0) return null

  return (
    <group data-testid="supernova-landmarks">
      <instancedMesh ref={coreRef} args={[undefined, undefined, landmarks.length]}>
        <sphereGeometry args={[0.085, 18, 14]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={SCENE_COLORS.supernovaCore}
          opacity={0.82}
          toneMapped={false}
          transparent
        />
      </instancedMesh>
      <instancedMesh ref={shellRef} args={[undefined, undefined, landmarks.length]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshBasicMaterial
          ref={shellMaterialRef}
          blending={AdditiveBlending}
          color={SCENE_COLORS.supernovaEdge}
          depthWrite={false}
          opacity={0.055}
          toneMapped={false}
          transparent
        />
      </instancedMesh>
      <instancedMesh ref={ringRef} args={[undefined, undefined, landmarks.length]}>
        <torusGeometry args={[0.36, 0.006, 8, 64]} />
        <meshBasicMaterial
          color={SCENE_COLORS.supernovaEdge}
          depthWrite={false}
          opacity={0.12}
          side={DoubleSide}
          transparent
        />
      </instancedMesh>
    </group>
  )
}
