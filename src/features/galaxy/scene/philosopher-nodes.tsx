import { Html, useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, Object3D, type InstancedMesh } from 'three'

import type { GalaxyPhilosopherNode } from '@/features/galaxy/types/galaxy'
import { useExperienceStore } from '@/stores/experience-store'

interface PhilosopherNodesProps {
  nodes: GalaxyPhilosopherNode[]
  selectedPhilosopherId: string | null
  onSelect: (id: string) => void
}

function nodeFromEvent(
  nodes: GalaxyPhilosopherNode[],
  event: { instanceId?: number },
) {
  return event.instanceId === undefined ? null : nodes[event.instanceId] ?? null
}

export function PhilosopherNodes({
  nodes,
  selectedPhilosopherId,
  onSelect,
}: PhilosopherNodesProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const hoveredPhilosopherId = useExperienceStore(
    (state) => state.hoveredPhilosopherId,
  )
  const setHoveredPhilosopherId = useExperienceStore(
    (state) => state.setHoveredPhilosopherId,
  )
  const temporaryObject = useMemo(() => new Object3D(), [])
  const temporaryColor = useMemo(() => new Color(), [])

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
    const mesh = meshRef.current

    if (!mesh) {
      return
    }

    nodes.forEach((node, index) => {
      const isSelected = node.philosopher.id === selectedPhilosopherId
      const isHovered = node.philosopher.id === hoveredPhilosopherId
      const scale = isSelected ? 1.65 : isHovered ? 1.35 : 1

      temporaryObject.position.set(
        node.position.x,
        node.position.y,
        node.position.z,
      )
      temporaryObject.scale.setScalar(scale)
      temporaryObject.updateMatrix()
      mesh.setMatrixAt(index, temporaryObject.matrix)
      mesh.setColorAt(index, temporaryColor.set(node.color))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [
    hoveredPhilosopherId,
    nodes,
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
        ref={meshRef}
        args={[undefined, undefined, nodes.length]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={() => setHoveredPhilosopherId(null)}
      >
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial
          emissive="#293252"
          emissiveIntensity={0.55}
          metalness={0.08}
          roughness={0.58}
          vertexColors
        />
      </instancedMesh>

      {hoveredNode && hoveredNode.philosopher.id !== selectedPhilosopherId ? (
        <Html
          center
          position={[
            hoveredNode.position.x,
            hoveredNode.position.y + 0.42,
            hoveredNode.position.z,
          ]}
          distanceFactor={12}
          style={{ pointerEvents: 'none' }}
        >
          <span className="whitespace-nowrap rounded-full border border-white/15 bg-[#080a13]/90 px-2.5 py-1 text-[10px] font-medium text-white shadow-xl backdrop-blur-md">
            {hoveredNode.philosopher.name}
          </span>
        </Html>
      ) : null}

      {selectedNode ? (
        <group
          position={[
            selectedNode.position.x,
            selectedNode.position.y,
            selectedNode.position.z,
          ]}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.25, 0.018, 8, 40]} />
            <meshBasicMaterial color="#e6e4ff" opacity={0.9} transparent />
          </mesh>
          <pointLight color="#c6c9ff" intensity={1.6} distance={2.2} />
        </group>
      ) : null}
    </>
  )
}
