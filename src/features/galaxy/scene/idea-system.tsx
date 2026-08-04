import { Html, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  CatmullRomCurve3,
  type Mesh,
  Vector3,
} from 'three'

import {
  createIdeaNodes,
  createRelatedIdeaNodes,
} from '@/features/galaxy/layout/idea-system'
import type {
  GalaxyIdeaSystem,
  GalaxyPhilosopherNode,
  GalaxyPosition,
} from '@/features/galaxy/types/galaxy'
import { SCENE_COLORS } from './scene-visuals'

interface IdeaSystemSceneProps {
  center: GalaxyPosition
  connectionsVisible: boolean
  ideaSystem: GalaxyIdeaSystem
  nodes: GalaxyPhilosopherNode[]
  onSelectIdea: (id: string) => void
  onSelectRelatedIdea: (philosopherId: string, ideaId: string) => void
  reducedMotion: boolean
}

function plainText(text: string) {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function excerpt(text: string, limit = 58) {
  const value = plainText(text)
  return value.length > limit ? `${value.slice(0, limit).trimEnd()}…` : value
}

function positionTuple(position: GalaxyPosition): [number, number, number] {
  return [position.x, position.y, position.z]
}

function agreementCurve(from: GalaxyPosition, to: GalaxyPosition) {
  const middle = new Vector3(
    (from.x + to.x) / 2,
    (from.y + to.y) / 2 + 0.34,
    (from.z + to.z) / 2 + 0.28,
  )
  return new CatmullRomCurve3([
    new Vector3(from.x, from.y, from.z),
    middle,
    new Vector3(to.x, to.y, to.z),
  ]).getPoints(20)
}

function FlowingAgreementMarker({
  from,
  reducedMotion,
  to,
}: {
  from: GalaxyPosition
  reducedMotion: boolean
  to: GalaxyPosition
}) {
  const markerRef = useRef<Mesh>(null)
  const curve = useMemo(() => {
    const middle = new Vector3(
      (from.x + to.x) / 2,
      (from.y + to.y) / 2 + 0.34,
      (from.z + to.z) / 2 + 0.28,
    )
    return new CatmullRomCurve3([
      new Vector3(from.x, from.y, from.z),
      middle,
      new Vector3(to.x, to.y, to.z),
    ])
  }, [from, to])

  useFrame((state) => {
    const marker = markerRef.current
    if (!marker) return
    const progress = reducedMotion
      ? 0.58
      : (state.clock.getElapsedTime() * 0.18) % 1
    marker.position.copy(curve.getPoint(progress))
  })

  return (
    <mesh ref={markerRef}>
      <sphereGeometry args={[0.055, 10, 10]} />
      <meshBasicMaterial
        blending={AdditiveBlending}
        color={SCENE_COLORS.agreement}
        toneMapped={false}
      />
    </mesh>
  )
}

export function IdeaSystemScene({
  center,
  connectionsVisible,
  ideaSystem,
  nodes,
  onSelectIdea,
  onSelectRelatedIdea,
  reducedMotion,
}: IdeaSystemSceneProps) {
  const ideaNodes = useMemo(
    () => createIdeaNodes(ideaSystem.ideas, center),
    [center, ideaSystem.ideas],
  )
  const selectedNode =
    ideaNodes.find((node) => node.idea.id === ideaSystem.selectedIdea?.id) ??
    null
  const relatedNodes = useMemo(
    () =>
      selectedNode
        ? createRelatedIdeaNodes(
            ideaSystem.agreeingIdeas,
            ideaSystem.disagreeingIdeas,
            selectedNode.position,
          )
        : [],
    [
      ideaSystem.agreeingIdeas,
      ideaSystem.disagreeingIdeas,
      selectedNode,
    ],
  )

  return (
    <group>
      {ideaNodes.map((node, index) => {
        const selected = node.idea.id === ideaSystem.selectedIdea?.id
        return (
          <group key={node.idea.id}>
            {connectionsVisible ? (
              <Line
                points={[positionTuple(center), positionTuple(node.position)]}
                color={SCENE_COLORS.ideaThread}
                lineWidth={selected ? 2.2 : 1.15}
                opacity={selected ? 0.78 : 0.34}
                transparent
              />
            ) : null}
            <mesh position={positionTuple(node.position)}>
              <icosahedronGeometry args={[selected ? 0.17 : 0.12, 1]} />
              <meshBasicMaterial
                color={selected ? SCENE_COLORS.selected : SCENE_COLORS.idea}
                toneMapped={false}
              />
            </mesh>
            <mesh position={positionTuple(node.position)} scale={selected ? 2.6 : 2}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshBasicMaterial
                blending={AdditiveBlending}
                color={selected ? SCENE_COLORS.selectedHalo : SCENE_COLORS.idea}
                depthWrite={false}
                opacity={selected ? 0.3 : 0.16}
                toneMapped={false}
                transparent
              />
            </mesh>
            <Html
              center
              position={[node.position.x, node.position.y + 0.32, node.position.z]}
            >
              <button
                className={`galaxy-idea-label${selected ? ' galaxy-idea-label--selected' : ''}`}
                data-idea-id={node.idea.id}
                type="button"
                onClick={() => onSelectIdea(node.idea.id)}
                aria-label={`Explore idea ${index + 1}: ${excerpt(node.idea.text, 90)}`}
              >
                <span>Idea {node.idea.order ?? index + 1}</span>
                {excerpt(node.idea.text)}
              </button>
            </Html>
          </group>
        )
      })}

      {selectedNode
        ? relatedNodes.map((node) => {
            const ownerNode = nodes.find(
              (candidate) => candidate.philosopher.id === node.idea.philosopherId,
            )
            const isAgreement = node.relation === 'agreement'
            const ownerName = ownerNode?.philosopher.name ?? 'Related thinker'

            return (
              <group key={`${node.relation}:${node.idea.id}`}>
                {connectionsVisible ? (
                  <>
                    {isAgreement ? (
                      <>
                        <Line
                          points={agreementCurve(selectedNode.position, node.position)}
                          color={SCENE_COLORS.agreement}
                          lineWidth={2.35}
                          opacity={0.9}
                          transparent
                        />
                        <FlowingAgreementMarker
                          from={selectedNode.position}
                          reducedMotion={reducedMotion}
                          to={node.position}
                        />
                      </>
                    ) : (
                      <Line
                        points={[
                          positionTuple(selectedNode.position),
                          [
                            (selectedNode.position.x + node.position.x) / 2 + 0.28,
                            (selectedNode.position.y + node.position.y) / 2 - 0.22,
                            (selectedNode.position.z + node.position.z) / 2,
                          ],
                          positionTuple(node.position),
                        ]}
                        color={SCENE_COLORS.disagreement}
                        dashed
                        dashSize={0.13}
                        gapSize={0.095}
                        lineWidth={2.15}
                        opacity={0.92}
                        transparent
                      />
                    )}
                    {ownerNode && ownerNode.philosopher.id !== ideaSystem.selectedIdea?.philosopherId ? (
                      <Line
                        points={[
                          positionTuple(node.position),
                          positionTuple(ownerNode.position),
                        ]}
                        color={isAgreement ? SCENE_COLORS.agreement : SCENE_COLORS.disagreement}
                        dashed={!isAgreement}
                        dashSize={0.09}
                        gapSize={0.16}
                        lineWidth={0.75}
                        opacity={0.28}
                        transparent
                      />
                    ) : null}
                  </>
                ) : null}
                <mesh position={positionTuple(node.position)}>
                  {isAgreement ? (
                    <sphereGeometry args={[0.13, 14, 14]} />
                  ) : (
                    <octahedronGeometry args={[0.16, 0]} />
                  )}
                  <meshBasicMaterial
                    color={isAgreement ? SCENE_COLORS.agreement : SCENE_COLORS.disagreement}
                    toneMapped={false}
                  />
                </mesh>
                <Html
                  center
                  position={[node.position.x, node.position.y + 0.3, node.position.z]}
                >
                  <button
                    className={`galaxy-relation-label galaxy-relation-label--${node.relation}`}
                    type="button"
                    onClick={() =>
                      onSelectRelatedIdea(node.idea.philosopherId, node.idea.id)
                    }
                  >
                    <span>{isAgreement ? 'Agrees · continuous' : 'Disagrees · interrupted'}</span>
                    <strong>{ownerName}</strong>
                    {excerpt(node.idea.text, 52)}
                  </button>
                </Html>
              </group>
            )
          })
        : null}
    </group>
  )
}
