import { Html, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  CatmullRomCurve3,
  type Group,
  Vector3,
} from 'three'

import {
  createIdeaFocusPosition,
  createIdeaOrbit,
  ideaOrbitAngleAtTime,
  ideaOrbitPositionAtAngle,
} from '@/features/galaxy/layout/idea-orbit'
import { createRelatedIdeaNodes } from '@/features/galaxy/layout/idea-system'
import { RELATION_EDGE_BUDGETS } from '@/features/galaxy/layout/relationship-budgets'
import type {
  GalaxyIdeaSystem,
  GalaxyPhilosopherNode,
  GalaxyPosition,
} from '@/features/galaxy/types/galaxy'
import {
  RELATION_VISUAL_CONFIG,
  SCENE_COLORS,
} from './scene-visuals'

interface IdeaSystemSceneProps {
  center: GalaxyPosition
  connectionsVisible: boolean
  ideaSystem: GalaxyIdeaSystem
  motionEnabled: boolean
  nodes: GalaxyPhilosopherNode[]
  onSelectIdea: (id: string) => void
  onSelectRelatedIdea: (philosopherId: string, ideaId: string) => void
  reducedMotion: boolean
  visibleIdeaOrbitLimit: number
}

function plainText(text: string) {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function excerpt(text: string, limit = 42) {
  const value = plainText(text)
  return value.length > limit ? `${value.slice(0, limit).trimEnd()}…` : value
}

function positionTuple(position: GalaxyPosition): [number, number, number] {
  return [position.x, position.y, position.z]
}

function agreementCurve(from: GalaxyPosition, to: GalaxyPosition) {
  const middle = new Vector3(
    (from.x + to.x) / 2,
    (from.y + to.y) / 2 + 0.3,
    (from.z + to.z) / 2 + 0.24,
  )
  return new CatmullRomCurve3([
    new Vector3(from.x, from.y, from.z),
    middle,
    new Vector3(to.x, to.y, to.z),
  ]).getPoints(20)
}

function IdeaBody({ selected = false }: { selected?: boolean }) {
  const radius = selected ? 0.14 : 0.078

  return (
    <>
      <mesh>
        <sphereGeometry args={[radius, 20, 16]} />
        <meshStandardMaterial
          color={selected ? SCENE_COLORS.selected : SCENE_COLORS.idea}
          emissive={selected ? SCENE_COLORS.selectedHalo : SCENE_COLORS.idea}
          emissiveIntensity={selected ? 0.2 : 0.08}
          metalness={0.04}
          roughness={0.38}
        />
      </mesh>
      <mesh scale={selected ? 1.42 : 1.32}>
        <sphereGeometry args={[radius, 16, 12]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={selected ? SCENE_COLORS.selectedHalo : SCENE_COLORS.idea}
          depthWrite={false}
          opacity={selected ? 0.08 : 0.045}
          toneMapped={false}
          transparent
        />
      </mesh>
    </>
  )
}

function IdeaLabel({
  idea,
  index,
  onSelectIdea,
  orbiting,
  selected = false,
}: {
  idea: GalaxyIdeaSystem['ideas'][number]
  index: number
  onSelectIdea: (id: string) => void
  orbiting: boolean
  selected?: boolean
}) {
  return (
    <Html center position={[0, 0.28, 0]}>
      <button
        className={`galaxy-idea-label${selected ? ' galaxy-idea-label--selected' : ''}`}
        data-idea-id={idea.id}
        data-orbiting={orbiting}
        type="button"
        onClick={() => onSelectIdea(idea.id)}
        aria-label={`Explore idea ${index + 1}: ${excerpt(idea.text, 90)}`}
      >
        <span>Idea {idea.order ?? index + 1}</span>
        <strong>{excerpt(idea.text)}</strong>
      </button>
    </Html>
  )
}

function OrbitingIdea({
  center,
  connectionsVisible,
  idea,
  index,
  motionEnabled,
  onSelectIdea,
  philosopherId,
  reducedMotion,
  showLabel,
  showOrbitTrack,
}: {
  center: GalaxyPosition
  connectionsVisible: boolean
  idea: GalaxyIdeaSystem['ideas'][number]
  index: number
  motionEnabled: boolean
  onSelectIdea: (id: string) => void
  philosopherId: string
  reducedMotion: boolean
  showLabel: boolean
  showOrbitTrack: boolean
}) {
  const orbit = useMemo(
    () => createIdeaOrbit(philosopherId, idea.id, index),
    [idea.id, index, philosopherId],
  )
  const satelliteRef = useRef<Group>(null)
  const spokeRef = useRef<Group>(null)
  const orbitTrack = useMemo(
    () =>
      Array.from({ length: 49 }, (_, pointIndex) => {
        const angle = (pointIndex / 48) * Math.PI * 2
        const point = ideaOrbitPositionAtAngle(orbit, angle)
        return [point.x, point.y, point.z] as [number, number, number]
      }),
    [orbit],
  )

  const updateOrbit = useCallback(
    (angle: number) => {
      const position = ideaOrbitPositionAtAngle(orbit, angle)
      satelliteRef.current?.position.set(position.x, position.y, position.z)
      if (spokeRef.current) {
        spokeRef.current.rotation.z = Math.atan2(position.y, position.x)
        spokeRef.current.scale.x = Math.hypot(position.x, position.y)
      }
    },
    [orbit],
  )

  useLayoutEffect(() => {
    updateOrbit(orbit.phase)
  }, [orbit.phase, updateOrbit])

  useFrame((state) => {
    updateOrbit(
      ideaOrbitAngleAtTime(
        orbit,
        state.clock.getElapsedTime(),
        reducedMotion || !motionEnabled,
      ),
    )
  })

  return (
    <group
      position={positionTuple(center)}
      rotation={[orbit.inclinationX, orbit.inclinationY, 0]}
    >
      {connectionsVisible ? (
        <>
          {showOrbitTrack ? (
            <Line
              points={orbitTrack}
              color={SCENE_COLORS.ideaThread}
              lineWidth={0.4}
              opacity={0.055}
              transparent
            />
          ) : null}
          <group ref={spokeRef}>
            <Line
              points={[[0.16, 0, 0], [1, 0, 0]]}
              color={SCENE_COLORS.ideaThread}
              lineWidth={0.55}
              opacity={0.18}
              transparent
            />
          </group>
        </>
      ) : null}
      <group ref={satelliteRef}>
        <IdeaBody />
        {showLabel ? (
          <IdeaLabel
            idea={idea}
            index={index}
            onSelectIdea={onSelectIdea}
            orbiting
          />
        ) : null}
      </group>
    </group>
  )
}

export function IdeaSystemScene({
  center,
  connectionsVisible,
  ideaSystem,
  motionEnabled,
  nodes,
  onSelectIdea,
  onSelectRelatedIdea,
  reducedMotion,
  visibleIdeaOrbitLimit,
}: IdeaSystemSceneProps) {
  const visibleIdeas = useMemo(() => {
    if (ideaSystem.selectedIdea) return [ideaSystem.selectedIdea]
    return ideaSystem.ideas.slice(
      0,
      Math.min(
        RELATION_EDGE_BUDGETS.philosopherIdeaEdges,
        visibleIdeaOrbitLimit,
      ),
    )
  }, [ideaSystem.ideas, ideaSystem.selectedIdea, visibleIdeaOrbitLimit])
  const selectedPosition = ideaSystem.selectedIdea
    ? createIdeaFocusPosition(center)
    : null
  const relatedNodes = useMemo(
    () =>
      selectedPosition
        ? createRelatedIdeaNodes(
            ideaSystem.agreeingIdeas,
            ideaSystem.disagreeingIdeas,
            selectedPosition,
          )
        : [],
    [ideaSystem.agreeingIdeas, ideaSystem.disagreeingIdeas, selectedPosition],
  )
  const philosopherId =
    ideaSystem.ideas[0]?.philosopherId ??
    ideaSystem.selectedIdea?.philosopherId ??
    'unknown-philosopher'

  return (
    <group>
      {visibleIdeas.map((idea, index) => {
        const selected = idea.id === ideaSystem.selectedIdea?.id
        if (!selected) {
          return (
            <OrbitingIdea
              key={idea.id}
              center={center}
              connectionsVisible={connectionsVisible}
              idea={idea}
              index={index}
              motionEnabled={motionEnabled}
              onSelectIdea={onSelectIdea}
              philosopherId={philosopherId}
              reducedMotion={reducedMotion}
              showLabel={index === 0}
              showOrbitTrack={index < 2}
            />
          )
        }

        if (!selectedPosition) return null
        return (
          <group key={idea.id}>
            {connectionsVisible ? (
              <Line
                points={[positionTuple(center), positionTuple(selectedPosition)]}
                color={SCENE_COLORS.ideaThread}
                lineWidth={1.1}
                opacity={0.5}
                transparent
              />
            ) : null}
            <group position={positionTuple(selectedPosition)}>
              <IdeaBody selected />
              <IdeaLabel
                idea={idea}
                index={index}
                onSelectIdea={onSelectIdea}
                orbiting={false}
                selected
              />
            </group>
          </group>
        )
      })}

      {selectedPosition
        ? relatedNodes.map((node, index) => {
            const ownerNode = nodes.find(
              (candidate) => candidate.philosopher.id === node.idea.philosopherId,
            )
            const isAgreement = node.relation === 'agreement'
            const ownerName = ownerNode?.philosopher.name ?? 'Related thinker'

            return (
              <group key={`${node.relation}:${node.idea.id}`}>
                {connectionsVisible ? (
                  isAgreement ? (
                    <Line
                      points={agreementCurve(selectedPosition, node.position)}
                      color={SCENE_COLORS.agreement}
                      lineWidth={1.05}
                      opacity={0.58}
                      transparent
                    />
                  ) : (
                    <Line
                      points={[
                        positionTuple(selectedPosition),
                        [
                          (selectedPosition.x + node.position.x) / 2 + 0.2,
                          (selectedPosition.y + node.position.y) / 2 - 0.16,
                          (selectedPosition.z + node.position.z) / 2,
                        ],
                        positionTuple(node.position),
                      ]}
                      color={SCENE_COLORS.disagreement}
                      dashed
                      dashSize={RELATION_VISUAL_CONFIG.disagreementDash}
                      gapSize={RELATION_VISUAL_CONFIG.disagreementGap}
                      lineWidth={1.1}
                      opacity={0.7}
                      transparent
                    />
                  )
                ) : null}
                <mesh position={positionTuple(node.position)}>
                  <sphereGeometry args={[0.1, 16, 14]} />
                  <meshBasicMaterial
                    color={
                      isAgreement
                        ? SCENE_COLORS.agreement
                        : SCENE_COLORS.disagreement
                    }
                    opacity={0.92}
                    toneMapped={false}
                    transparent
                  />
                </mesh>
                {!isAgreement ? (
                  <mesh
                    position={positionTuple(node.position)}
                    rotation={[0.45, 0.2, 0.3]}
                  >
                    <torusGeometry args={[0.16, 0.008, 6, 32]} />
                    <meshBasicMaterial
                      color={SCENE_COLORS.disagreement}
                      opacity={0.5}
                      transparent
                    />
                  </mesh>
                ) : null}
                {index < 2 ? (
                  <Html
                    center
                    position={[
                      node.position.x,
                      node.position.y + 0.25,
                      node.position.z,
                    ]}
                  >
                    <button
                      className={`galaxy-relation-label galaxy-relation-label--${node.relation}`}
                      type="button"
                      onClick={() =>
                        onSelectRelatedIdea(node.idea.philosopherId, node.idea.id)
                      }
                    >
                      <span>{isAgreement ? 'Agreement' : 'Disagreement'}</span>
                      <strong>{ownerName}</strong>
                    </button>
                  </Html>
                ) : null}
              </group>
            )
          })
        : null}
    </group>
  )
}
