import { Stars } from '@react-three/drei'

interface GalaxyEnvironmentProps {
  active: boolean
  reducedMotion: boolean
}

export function GalaxyEnvironment({
  active,
  reducedMotion,
}: GalaxyEnvironmentProps) {
  return (
    <>
      <color attach="background" args={['#060812']} />
      <fog attach="fog" args={['#060812', 22, 52]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        color="#aeb8f5"
        intensity={1.15}
        position={[-4, 6, 8]}
      />
      <pointLight color="#8ea4d9" intensity={4} position={[4, -2, 8]} />
      <Stars
        count={700}
        depth={45}
        factor={2.1}
        fade
        radius={72}
        saturation={0}
        speed={reducedMotion ? 0 : active ? 0.16 : 0.06}
      />
    </>
  )
}
