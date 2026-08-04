import { Html, useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  AdditiveBlending,
  Object3D,
  type InstancedMesh,
} from 'three'

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
import type { GalaxyPhilosopherNode } from '@/features/galaxy/types/galaxy'
import { useExperienceStore } from '@/stores/experience-store'

interface PhilosopherNodesProps {
  nodes: GalaxyPhilosopherNode[]
  quality: SceneQuality
  selectedPhilosopherId: string | null
  onSelect: (id: string) => void
}

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
  nodes,
  quality,
  selectedPhilosopherId,
  onSelect,
}: PhilosopherNodesProps) {
  const coreMeshRef = useRef<InstancedMesh>(null)
  const haloMeshRef = useRef<InstancedMesh>(null)
  const hoveredPhilosopherId = useExperienceStore(
    (state) => state.hoveredPhilosopherId,
  )
  const setHoveredPhilosopherId = useExperienceStore(
    (state) => state.setHoveredPhilosopherId,
  )
  const temporaryObject = useMemo(() => new Object3D(), [])

  const hoveredNode = useMemo(
    () =>
      nodes.find(
        (node) => node.philosopher.id === hoveredPhilosopherId,
      ) ?? null,
    [hoveredPhilosopherId, nodes],
  )
  const selectedNode = useMemo(
    () =>
      nodes.find(
        (node) => node.philosopher.id === selectedPhilosopherId,
      ) ?? null,
    [nodes, selectedPhilosopherId],
  )

  useCursor(hoveredNode !== null)

  useLayoutEffect(() => {
    const coreMesh = coreMeshRef.current
    const haloMesh = haloMeshRef.current

    if (!coreMesh || !haloMesh) {
      return
    }

    nodes.forEach((node, index) => {
      const isSelected = node.philosopher.id === selectedPhilosopherId
      const isHovered = node.philosopher.id === hoveredPhilosopherId
      const emphasis = isSelected
        ? NODE_VISUAL_CONFIG.selectedScale
        : isHovered
          ? NODE_VISUAL_CONFIG.hoverScale
          : selectedPhilosopherId
            ? NODE_VISUAL_CONFIG.deEmphasizedScale
            : 1
      const coreScale = quality.nodeScaleMultiplier * emphasis
      const haloScale =
        quality.nodeScaleMultiplier *
        quality.haloScaleMultiplier *
        emphasis *
        (isSelected ? 1.32 : isHovered ? 1.16 : 1)

      temporaryObject.position.set(
        node.position.x,
        node.position.y,
        node.position.z,
      )

      temporaryObject.scale.setScalar(coreScale)
      temporaryObject.updateMatrix()
      coreMesh.setMatrixAt(index, temporaryObject.matrix)

      temporaryObject.scale.setScalar(haloScale)
      temporaryObject.updateMatrix()
      haloMesh.setMatrixAt(index, temporaryObject.matrix)

    })

    for (const mesh of [coreMesh, haloMesh]) {
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    }
  }, [
    hoveredPhilosopherId,
    nodes,
    quality.haloScaleMultiplier,
    quality.nodeScaleMultiplier,
    selectedPhilosopherId,
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
        <sphereGeometry args={[NODE_VISUAL_CONFIG.coreRadius, 12, 12]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={SCENE_COLORS.semanticHalo}
          depthWrite={false}
          opacity={NODE_VISUAL_CONFIG.haloOpacity}
          toneMapped={false}
          transparent
        />
      </instancedMesh>

      <instancedMesh
        ref={coreMeshRef}
        args={[undefined, undefined, nodes.length]}
        frustumCulled={false}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={() => setHoveredPhilosopherId(null)}
      >
        <sphereGeometry args={[NODE_VISUAL_CONFIG.coreRadius, 14, 14]} />
        <meshBasicMaterial
          color={SCENE_COLORS.semanticCore}
          toneMapped={false}
        />
      </instancedMesh>

      {hoveredNode && hoveredNode.philosopher.id !== selectedPhilosopherId ? (
        <>
          <group
            position={[
              hoveredNode.position.x,
              hoveredNode.position.y,
              hoveredNode.position.z,
            ]}
          >
            <mesh>
              <torusGeometry args={[0.31 * quality.nodeScaleMultiplier, 0.018, 8, 36]} />
              <meshBasicMaterial
                color={SCENE_COLORS.hovered}
                opacity={0.78}
                toneMapped={false}
                transparent
              />
            </mesh>
          </group>
          <Html
            center
            position={[
              hoveredNode.position.x,
              hoveredNode.position.y + 0.62,
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
                  {' · '}
                  {hoveredNode.schoolLabel}
                </span>
              </span>
            </div>
          </Html>
        </>
      ) : null}

      {selectedNode ? (
        <group
          position={[
            selectedNode.position.x,
            selectedNode.position.y,
            selectedNode.position.z,
          ]}
        >
          <mesh>
            <torusGeometry
              args={[0.38 * quality.nodeScaleMultiplier, 0.026, 10, 56]}
            />
            <meshBasicMaterial
              color={SCENE_COLORS.selected}
              opacity={0.98}
              toneMapped={false}
              transparent
            />
          </mesh>
          <mesh rotation={[0.42, 0.18, Math.PI / 3]}>
            <torusGeometry
              args={[0.54 * quality.nodeScaleMultiplier, 0.012, 8, 56]}
            />
            <meshBasicMaterial
              color={SCENE_COLORS.selectedHalo}
              opacity={0.58}
              toneMapped={false}
              transparent
            />
          </mesh>
          <mesh scale={quality.nodeScaleMultiplier * 3.2}>
            <sphereGeometry args={[NODE_VISUAL_CONFIG.coreRadius, 14, 14]} />
            <meshBasicMaterial
              blending={AdditiveBlending}
              color={SCENE_COLORS.selectedHalo}
              depthWrite={false}
              opacity={NODE_VISUAL_CONFIG.selectedHaloOpacity}
              toneMapped={false}
              transparent
            />
          </mesh>
          <Html center position={[0, 0.78, 0]}>
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
        </group>
      ) : null}
    </>
  )
}
