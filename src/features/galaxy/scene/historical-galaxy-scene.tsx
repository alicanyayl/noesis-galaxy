import { useMemo } from 'react'

import { SchoolLabels } from '@/features/galaxy/scene/school-labels'
import type { GalaxyPhilosopherNode } from '@/features/galaxy/types/galaxy'

import { CameraRig } from './camera-rig'
import { EraGuides } from './era-guides'
import { GalaxyEnvironment } from './galaxy-environment'
import { PhilosopherNodes } from './philosopher-nodes'

interface HistoricalGalaxySceneProps {
  active: boolean
  nodes: GalaxyPhilosopherNode[]
  selectedPhilosopherId: string | null
  onSelect: (id: string) => void
  reducedMotion: boolean
  eraGuidesVisible: boolean
  labelsVisible: boolean
  cameraResetRequest: number
}

export function HistoricalGalaxyScene({
  active,
  nodes,
  selectedPhilosopherId,
  onSelect,
  reducedMotion,
  eraGuidesVisible,
  labelsVisible,
  cameraResetRequest,
}: HistoricalGalaxySceneProps) {
  const focus = useMemo(
    () =>
      nodes.find(
        (node) => node.philosopher.id === selectedPhilosopherId,
      )?.position ?? null,
    [nodes, selectedPhilosopherId],
  )

  return (
    <>
      <GalaxyEnvironment active={active} reducedMotion={reducedMotion} />
      {eraGuidesVisible ? <EraGuides /> : null}
      {labelsVisible ? <SchoolLabels nodes={nodes} /> : null}
      <PhilosopherNodes
        nodes={nodes}
        selectedPhilosopherId={selectedPhilosopherId}
        onSelect={onSelect}
      />
      <CameraRig
        focus={focus}
        reducedMotion={reducedMotion}
        resetRequest={cameraResetRequest}
      />
    </>
  )
}
