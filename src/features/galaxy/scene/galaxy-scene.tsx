import { Stars, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Mesh } from 'three'
import { MathUtils } from 'three'

const SCENE_PALETTE = {
  accent: '#9da8ff',
  background: '#070914',
  core: '#bac4ff',
  coreHover: '#ddd8ff',
  emissive: '#555caa',
  ring: '#7781bd',
} as const

interface GalaxySceneProps {
  isActive: boolean
  reducedMotion: boolean
}

function CelestialPlaceholder({
  isActive,
  reducedMotion,
}: GalaxySceneProps) {
  const coreRef = useRef<Mesh>(null)
  const ringRef = useRef<Mesh>(null)
  const [isHovered, setIsHovered] = useState(false)

  useCursor(isHovered)

  useFrame(({ clock }, delta) => {
    const core = coreRef.current
    const ring = ringRef.current

    if (!core || !ring) {
      return
    }

    const targetScale = isHovered ? 1.08 : isActive ? 1 : 0.92
    const nextScale = MathUtils.damp(core.scale.x, targetScale, 5, delta)
    core.scale.setScalar(nextScale)

    if (reducedMotion) {
      return
    }

    core.rotation.x += delta * 0.06
    core.rotation.y += delta * (isActive ? 0.12 : 0.06)
    core.position.y = Math.sin(clock.elapsedTime * 0.45) * 0.08
    ring.rotation.z += delta * 0.035
  })

  return (
    <group position={[0.75, 0, 0]}>
      <mesh
        ref={coreRef}
        onPointerOver={(event) => {
          event.stopPropagation()
          setIsHovered(true)
        }}
        onPointerOut={() => setIsHovered(false)}
      >
        <icosahedronGeometry args={[0.82, 3]} />
        <meshStandardMaterial
          color={isHovered ? SCENE_PALETTE.coreHover : SCENE_PALETTE.core}
          emissive={SCENE_PALETTE.emissive}
          emissiveIntensity={isHovered ? 0.75 : 0.48}
          metalness={0.16}
          roughness={0.62}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[1.08, 0.12, 0.18]}>
        <torusGeometry args={[1.18, 0.009, 10, 128]} />
        <meshBasicMaterial
          color={SCENE_PALETTE.ring}
          opacity={isActive ? 0.58 : 0.3}
          transparent
        />
      </mesh>
    </group>
  )
}

export function GalaxyScene({ isActive, reducedMotion }: GalaxySceneProps) {
  return (
    <>
      <color attach="background" args={[SCENE_PALETTE.background]} />
      <ambientLight intensity={0.42} />
      <directionalLight
        color={SCENE_PALETTE.accent}
        intensity={1.35}
        position={[-3, 4, 5]}
      />
      <pointLight
        color={SCENE_PALETTE.core}
        intensity={5}
        position={[2.8, -1.5, 2.5]}
      />
      <Stars
        count={900}
        depth={32}
        factor={2.25}
        fade
        radius={55}
        saturation={0}
        speed={reducedMotion ? 0 : isActive ? 0.28 : 0.12}
      />
      <CelestialPlaceholder
        isActive={isActive}
        reducedMotion={reducedMotion}
      />
    </>
  )
}
