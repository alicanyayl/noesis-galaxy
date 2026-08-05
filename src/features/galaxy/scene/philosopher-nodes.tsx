import { Html, useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Object3D,
  type InstancedMesh,
} from 'three'

import { deterministicUnit } from '@/features/galaxy/layout/deterministic-hash'
import { formatPhilosopherLifespan } from '@/features/galaxy/layout/lifespan'
import {
  philosopherInitials,
  philosopherPortraitUrl,
  philosopherThumbnailUrl,
} from '@/features/galaxy/layout/portrait'
import type { SceneQuality } from '@/features/galaxy/scene/scene-quality'
import {
  NODE_VISUAL_CONFIG,
  SCENE_COLORS,
} from '@/features/galaxy/scene/scene-visuals'
import type {
  GalaxyPhilosopherNode,
  PhilosopherNodeVariant,
} from '@/features/galaxy/types/galaxy'
import { useExperienceStore } from '@/stores/experience-store'

interface PhilosopherNodesProps {
  ideaFocusActive: boolean
  nodes: GalaxyPhilosopherNode[]
  quality: SceneQuality
  selectedPhilosopherId: string | null
  onSelect: (id: string) => void
}

const VARIANT_SCALE: Record<PhilosopherNodeVariant, number> = {
  stellar: 1.08,
  ringed: 1.04,
  corona: 1,
  binary: 0.94,
  crystalline: 0.9,
}

const CELESTIAL_PALETTE = [
  '#7798b1',
  '#a7b8c2',
  '#aa9b94',
  '#858da8',
  '#71979b',
] as const

const bodyVertexShader = /* glsl */ `
  attribute vec3 aBodyColor;
  attribute float aSurfaceSeed;
  attribute float aSurfaceRoughness;
  attribute float aAtmosphere;

  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vBodyColor;
  varying vec3 vObjectNormal;
  varying float vSurfaceSeed;
  varying float vSurfaceRoughness;
  varying float vAtmosphere;

  void main() {
    mat4 instanceModelMatrix = modelMatrix * instanceMatrix;
    vec4 worldPosition = instanceModelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(instanceModelMatrix) * normal);
    vObjectNormal = normal;
    vBodyColor = aBodyColor;
    vSurfaceSeed = aSurfaceSeed;
    vSurfaceRoughness = aSurfaceRoughness;
    vAtmosphere = aAtmosphere;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const bodyFragmentShader = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vBodyColor;
  varying vec3 vObjectNormal;
  varying float vSurfaceSeed;
  varying float vSurfaceRoughness;
  varying float vAtmosphere;

  float surfaceNoise(vec3 point, float seed) {
    float broad = sin(point.x * 8.0 + seed * 19.0) *
      sin(point.y * 11.0 - seed * 13.0) *
      sin(point.z * 9.0 + seed * 7.0);
    float fine = sin(dot(point, vec3(27.0, 21.0, 31.0)) + seed * 43.0);
    return broad * 0.68 + fine * 0.32;
  }

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 lightDirection = normalize(vec3(-0.48, 0.72, 0.58));
    vec3 halfDirection = normalize(lightDirection + viewDirection);

    float lightAmount = dot(normal, lightDirection);
    float daySide = smoothstep(-0.22, 0.72, lightAmount);
    float skyFill = 0.13 + max(normal.y, 0.0) * 0.12;
    float noise = surfaceNoise(normalize(vObjectNormal), vSurfaceSeed);
    float surfaceVariation = 1.0 + noise * (0.055 + vSurfaceRoughness * 0.035);
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.7) * vAtmosphere;
    float specular = pow(max(dot(normal, halfDirection), 0.0), 28.0 - vSurfaceRoughness * 12.0) * 0.24;

    vec3 shadowColor = vBodyColor * vec3(0.12, 0.16, 0.22);
    vec3 dayColor = vBodyColor * (0.66 + daySide * 0.56) * surfaceVariation;
    vec3 color = mix(shadowColor, dayColor, daySide) + vBodyColor * skyFill;
    color += vec3(0.62, 0.82, 1.0) * rim * 0.5;
    color += vec3(0.92, 0.97, 1.0) * specular * daySide;
    gl_FragColor = vec4(color, 1.0);
  }
`

function nodeFromEvent(
  nodes: GalaxyPhilosopherNode[],
  event: { instanceId?: number },
) {
  return event.instanceId === undefined ? null : nodes[event.instanceId] ?? null
}

function ScenePortrait({
  node,
  selected,
}: {
  node: GalaxyPhilosopherNode
  selected: boolean
}) {
  const imageUrl = selected
    ? philosopherPortraitUrl(node.philosopher)
    : philosopherThumbnailUrl(node.philosopher)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  return (
    <div
      className={`galaxy-scene-portrait${selected ? ' galaxy-scene-portrait--selected' : ''}`}
      data-portrait-state={imageUrl && failedUrl !== imageUrl ? 'image' : 'fallback'}
    >
      {imageUrl && failedUrl !== imageUrl ? (
        <img
          alt=""
          loading="lazy"
          src={imageUrl}
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <span>{philosopherInitials(node.philosopher)}</span>
      )}
    </div>
  )
}

export function PhilosopherNodes({
  ideaFocusActive,
  nodes,
  quality,
  selectedPhilosopherId,
  onSelect,
}: PhilosopherNodesProps) {
  const surfaceMeshRef = useRef<InstancedMesh>(null)
  const haloMeshRef = useRef<InstancedMesh>(null)
  const ringMeshRef = useRef<InstancedMesh>(null)
  const moonMeshRef = useRef<InstancedMesh>(null)
  const hoveredPhilosopherId = useExperienceStore(
    (state) => state.hoveredPhilosopherId,
  )
  const setHoveredPhilosopherId = useExperienceStore(
    (state) => state.setHoveredPhilosopherId,
  )
  const temporaryObject = useMemo(() => new Object3D(), [])
  const temporaryColor = useMemo(() => new Color(), [])
  const eraColor = useMemo(() => new Color(), [])
  const surfaceAttributes = useMemo(() => {
    const seeds = new Float32Array(nodes.length)
    const roughness = new Float32Array(nodes.length)
    const atmosphere = new Float32Array(nodes.length)
    const colors = new Float32Array(nodes.length * 3)
    const bodyColor = new Color()
    const localEraColor = new Color()
    nodes.forEach((node, index) => {
      const id = node.philosopher.id
      const paletteIndex = Math.min(
        CELESTIAL_PALETTE.length - 1,
        Math.floor(
          deterministicUnit(id, 'celestial-palette') *
            CELESTIAL_PALETTE.length,
        ),
      )
      seeds[index] = deterministicUnit(id, 'celestial-surface')
      roughness[index] = 0.35 + deterministicUnit(id, 'celestial-roughness') * 0.58
      atmosphere[index] = 0.32 + deterministicUnit(id, 'celestial-atmosphere') * 0.52
      bodyColor.set(CELESTIAL_PALETTE[paletteIndex])
      localEraColor.set(node.color)
      bodyColor.lerp(localEraColor, 0.16)
      colors[index * 3] = bodyColor.r
      colors[index * 3 + 1] = bodyColor.g
      colors[index * 3 + 2] = bodyColor.b
    })
    return { seeds, roughness, atmosphere, colors }
  }, [nodes])

  const hoveredNode = useMemo(
    () =>
      nodes.find((node) => node.philosopher.id === hoveredPhilosopherId) ??
      null,
    [hoveredPhilosopherId, nodes],
  )
  const selectedNode = useMemo(
    () =>
      nodes.find((node) => node.philosopher.id === selectedPhilosopherId) ??
      null,
    [nodes, selectedPhilosopherId],
  )

  useCursor(hoveredNode !== null)

  useLayoutEffect(() => {
    const surfaceMesh = surfaceMeshRef.current
    const haloMesh = haloMeshRef.current
    const ringMesh = ringMeshRef.current
    const moonMesh = moonMeshRef.current
    if (!surfaceMesh || !haloMesh || !ringMesh || !moonMesh) return

    nodes.forEach((node, index) => {
      const isSelected = node.philosopher.id === selectedPhilosopherId
      const isHovered = node.philosopher.id === hoveredPhilosopherId
      const emphasis = isSelected
        ? NODE_VISUAL_CONFIG.selectedScale * (ideaFocusActive ? 0.72 : 1)
        : isHovered
          ? NODE_VISUAL_CONFIG.hoverScale
          : selectedPhilosopherId
            ? NODE_VISUAL_CONFIG.deEmphasizedScale
            : 1
      const baseScale =
        quality.nodeScaleMultiplier * VARIANT_SCALE[node.variant] * emphasis

      temporaryObject.position.set(
        node.position.x,
        node.position.y,
        node.position.z,
      )
      temporaryObject.rotation.set(
        node.pathProgress * 0.32,
        node.pathProgress * 0.58,
        node.pathProgress * Math.PI * 1.2,
      )
      temporaryObject.scale.setScalar(baseScale)
      temporaryObject.updateMatrix()
      surfaceMesh.setMatrixAt(index, temporaryObject.matrix)

      const paletteIndex = Math.min(
        CELESTIAL_PALETTE.length - 1,
        Math.floor(
          deterministicUnit(node.philosopher.id, 'celestial-palette') *
            CELESTIAL_PALETTE.length,
        ),
      )
      temporaryColor.set(CELESTIAL_PALETTE[paletteIndex])
      eraColor.set(node.color)
      temporaryColor.lerp(eraColor, 0.16)
      const haloScale =
        baseScale *
        quality.haloScaleMultiplier *
        (node.variant === 'corona' ? 1.28 : node.variant === 'stellar' ? 1.12 : 1)
      temporaryObject.rotation.set(0, 0, 0)
      temporaryObject.scale.setScalar(haloScale)
      temporaryObject.updateMatrix()
      haloMesh.setMatrixAt(index, temporaryObject.matrix)
      haloMesh.setColorAt(index, temporaryColor)

      temporaryObject.rotation.set(
        0.48,
        0.28 + node.pathProgress * 0.4,
        node.pathProgress * Math.PI * 1.4,
      )
      temporaryObject.scale.setScalar(
        node.variant === 'ringed' && !isSelected ? baseScale : 0,
      )
      temporaryObject.updateMatrix()
      ringMesh.setMatrixAt(index, temporaryObject.matrix)
      ringMesh.setColorAt(index, temporaryColor)

      temporaryObject.position.set(
        node.position.x + 0.19 * baseScale,
        node.position.y + 0.08 * baseScale,
        node.position.z + 0.035,
      )
      temporaryObject.rotation.set(0, 0, 0)
      temporaryObject.scale.setScalar(
        node.variant === 'binary' && !isSelected ? baseScale : 0,
      )
      temporaryObject.updateMatrix()
      moonMesh.setMatrixAt(index, temporaryObject.matrix)
      moonMesh.setColorAt(index, temporaryColor)
    })

    for (const mesh of [surfaceMesh, haloMesh, ringMesh, moonMesh]) {
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      mesh.computeBoundingSphere()
    }
  }, [
    hoveredPhilosopherId,
    eraColor,
    ideaFocusActive,
    nodes,
    quality.haloScaleMultiplier,
    quality.nodeScaleMultiplier,
    selectedPhilosopherId,
    temporaryColor,
    temporaryObject,
  ])

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    setHoveredPhilosopherId(
      nodeFromEvent(nodes, event)?.philosopher.id ?? null,
    )
  }

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const node = nodeFromEvent(nodes, event)
    if (node) onSelect(node.philosopher.id)
  }

  return (
    <>
      <instancedMesh
        ref={haloMeshRef}
        args={[undefined, undefined, nodes.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[NODE_VISUAL_CONFIG.coreRadius, 16, 12]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={NODE_VISUAL_CONFIG.haloOpacity}
          toneMapped={false}
          transparent
          vertexColors
        />
      </instancedMesh>

      <instancedMesh
        ref={ringMeshRef}
        args={[undefined, undefined, nodes.length]}
        frustumCulled={false}
      >
        <torusGeometry args={[0.17, 0.006, 8, 40]} />
        <meshBasicMaterial
          depthWrite={false}
          opacity={NODE_VISUAL_CONFIG.ringOpacity}
          side={DoubleSide}
          toneMapped={false}
          transparent
          vertexColors
        />
      </instancedMesh>

      <instancedMesh
        ref={moonMeshRef}
        args={[undefined, undefined, nodes.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.038, 12, 10]} />
        <meshBasicMaterial toneMapped={false} vertexColors />
      </instancedMesh>

      <instancedMesh
        ref={surfaceMeshRef}
        args={[undefined, undefined, nodes.length]}
        frustumCulled={false}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={() => setHoveredPhilosopherId(null)}
      >
        <sphereGeometry args={[NODE_VISUAL_CONFIG.coreRadius, 28, 20]}>
          <instancedBufferAttribute
            attach="attributes-aBodyColor"
            args={[surfaceAttributes.colors, 3]}
          />
          <instancedBufferAttribute
            attach="attributes-aSurfaceSeed"
            args={[surfaceAttributes.seeds, 1]}
          />
          <instancedBufferAttribute
            attach="attributes-aSurfaceRoughness"
            args={[surfaceAttributes.roughness, 1]}
          />
          <instancedBufferAttribute
            attach="attributes-aAtmosphere"
            args={[surfaceAttributes.atmosphere, 1]}
          />
        </sphereGeometry>
        <shaderMaterial
          fragmentShader={bodyFragmentShader}
          toneMapped={false}
          vertexShader={bodyVertexShader}
        />
      </instancedMesh>

      {hoveredNode && hoveredNode.philosopher.id !== selectedPhilosopherId ? (
        <Html
          center
          position={[
            hoveredNode.position.x,
            hoveredNode.position.y + 0.46,
            hoveredNode.position.z,
          ]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="galaxy-hover-card">
            <ScenePortrait node={hoveredNode} selected={false} />
            <span className="galaxy-hover-label">
              <strong>{hoveredNode.philosopher.name}</strong>
              <span>
                {formatPhilosopherLifespan(
                  hoveredNode.philosopher.birthYear,
                  hoveredNode.philosopher.deathYear,
                )}
              </span>
            </span>
          </div>
        </Html>
      ) : null}

      {selectedNode ? (
        <group
          position={[
            selectedNode.position.x,
            selectedNode.position.y,
            selectedNode.position.z,
          ]}
          scale={ideaFocusActive ? 0.74 : 1}
        >
          <mesh>
            <sphereGeometry
              args={[0.215 * quality.nodeScaleMultiplier, 48, 36]}
            />
            <meshPhysicalMaterial
              color={SCENE_COLORS.selected}
              clearcoat={0.12}
              emissive="#3a1e0d"
              emissiveIntensity={0.08}
              metalness={0}
              roughness={0.62}
            />
          </mesh>
          <mesh scale={1.28}>
            <sphereGeometry
              args={[0.215 * quality.nodeScaleMultiplier, 32, 24]}
            />
            <meshBasicMaterial
              blending={AdditiveBlending}
              color={SCENE_COLORS.selectedHalo}
              depthWrite={false}
              opacity={0.07}
              toneMapped={false}
              transparent
            />
          </mesh>
          <mesh rotation={[0.56, 0.3, 0.72]}>
            <torusGeometry
              args={[
                0.3 * quality.nodeScaleMultiplier,
                0.004,
                8,
                64,
              ]}
            />
            <meshBasicMaterial
              color={SCENE_COLORS.selected}
              depthWrite={false}
              opacity={0.17}
              side={DoubleSide}
              toneMapped={false}
              transparent
            />
          </mesh>
          <pointLight
            color={SCENE_COLORS.selected}
            decay={2}
            distance={4.5}
            intensity={0.38}
            position={[0, 0, 0.45]}
          />
          {!ideaFocusActive ? (
            <Html center position={[0, 0.62, 0]}>
              <div className="galaxy-selected-identity">
                <ScenePortrait node={selectedNode} selected />
                <span>
                  <strong>{selectedNode.philosopher.name}</strong>
                  <small>
                    {formatPhilosopherLifespan(
                      selectedNode.philosopher.birthYear,
                      selectedNode.philosopher.deathYear,
                    )}
                    {' · '}
                    {selectedNode.schoolLabel}
                  </small>
                </span>
              </div>
            </Html>
          ) : null}
        </group>
      ) : null}
    </>
  )
}
