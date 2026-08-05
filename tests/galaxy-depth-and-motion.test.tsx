import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  normalizeKeyIdea,
  normalizePhilosopherSummary,
} from '@/api/philosophers'
import { SceneControls } from '@/features/galaxy/components/scene-controls'
import { calculateGalaxyBounds } from '@/features/galaxy/layout/galaxy-bounds'
import {
  CAMERA_CONTROL_CONFIG,
  createGalaxyCameraState,
} from '@/features/galaxy/layout/camera-modes'
import {
  createEchoArmPosition,
  createHistoricalSpiralPosition,
  historicalPathProgress,
} from '@/features/galaxy/layout/historical-curve'
import {
  createIdeaOrbit,
  ideaOrbitAngleAtTime,
  ideaOrbitPositionAtAngle,
} from '@/features/galaxy/layout/idea-orbit'
import {
  createPhilosopherNodeVariant,
  NODE_VARIANT_METADATA_KEYS,
} from '@/features/galaxy/layout/node-variant'
import { calculateOverviewCamera } from '@/features/galaxy/layout/overview-camera'
import { createSchoolArcOffset } from '@/features/galaxy/layout/philosopher-position'
import {
  RELATION_EDGE_BUDGETS,
  RELATION_EDGE_STYLES,
  relationLimitForExpandedState,
} from '@/features/galaxy/layout/relationship-budgets'
import {
  createSupernovaLandmarks,
  supernovaShellOpacityAtTime,
} from '@/features/galaxy/layout/supernova-landmarks'
import { getSceneQuality } from '@/features/galaxy/scene/scene-quality'
import {
  BACKGROUND_VISUAL_CONFIG,
  RELATION_VISUAL_CONFIG,
  SCENE_COLORS,
  SUPERNOVA_VISUAL_CONFIG,
} from '@/features/galaxy/scene/scene-visuals'
import { useExperienceStore } from '@/stores/experience-store'
import {
  rawOwnedKeyIdeaDetailFixture,
  rawPhilosopherFixture,
} from './fixtures/philosophers-api'

describe('Phase 2.75 authored spatial composition', () => {
  it('keeps the refined spiral deterministic with meaningful depth', () => {
    expect(createHistoricalSpiralPosition(0.63)).toEqual(
      createHistoricalSpiralPosition(0.63),
    )
    const points = Array.from({ length: 21 }, (_, index) =>
      createHistoricalSpiralPosition(index / 20),
    )
    const depth = points.map((point) => point.z)

    expect(Math.max(...depth) - Math.min(...depth)).toBeGreaterThan(2)
  })

  it('creates deterministic echo arms without replacing the primary route', () => {
    const primary = createHistoricalSpiralPosition(0.52)
    const firstEcho = createEchoArmPosition(0.52, 0)
    const secondEcho = createEchoArmPosition(0.52, 1)

    expect(firstEcho).toEqual(createEchoArmPosition(0.52, 0))
    expect(firstEcho).not.toEqual(primary)
    expect(secondEcho).not.toEqual(firstEcho)
  })

  it('preserves chronological order after the spiral refinement', () => {
    const progress = [-600, -1, 500, 1_200, 1_650, 1_900, 2_000].map(
      historicalPathProgress,
    )

    expect(progress).toEqual([...progress].sort((a, b) => a - b))
    expect(new Set(progress).size).toBe(progress.length)
  })

  it('keeps school arcs deterministic while adding local depth', () => {
    const offset = createSchoolArcOffset('philosopher-a', 'stoicism', 0.4)

    expect(offset).toEqual(
      createSchoolArcOffset('philosopher-a', 'stoicism', 0.4),
    )
    expect(offset).not.toEqual(
      createSchoolArcOffset('philosopher-b', 'stoicism', 0.4),
    )
  })
})

describe('metadata-based philosopher accents', () => {
  it('maps identical metadata to the same restrained accent', () => {
    const philosopher = normalizePhilosopherSummary(rawPhilosopherFixture)

    expect(createPhilosopherNodeVariant(philosopher)).toBe(
      createPhilosopherNodeVariant(philosopher),
    )
    expect(typeof createPhilosopherNodeVariant(philosopher)).toBe('string')
  })

  it('uses only the documented presentation metadata', () => {
    const first = normalizePhilosopherSummary(rawPhilosopherFixture)
    const second = normalizePhilosopherSummary({
      ...rawPhilosopherFixture,
      id: '00000000-0000-4000-8000-000000000099',
      name: 'A different display name',
      username: '@DifferentDisplayName',
      interests: 'Logic',
      topicalDescription: 'Different prose that must not imply rank.',
      wikiTitle: 'Different wiki title',
      hasEBooks: false,
      libriVoxIDs: [],
      libriVoxGetRequestLinks: [],
    })

    expect(NODE_VARIANT_METADATA_KEYS).toEqual([
      'birthYear.era',
      'deathYear.era',
      'school',
      'imageReferences',
    ])
    expect(createPhilosopherNodeVariant(second)).toBe(
      createPhilosopherNodeVariant(first),
    )
  })

})

describe('semantic palette and responsive cosmos', () => {
  it('defines every required semantic color token', () => {
    expect(SCENE_COLORS).toMatchObject({
      background: expect.stringMatching(/^#/),
      distantStar: expect.stringMatching(/^#/),
      semanticCore: expect.stringMatching(/^#/),
      selected: expect.stringMatching(/^#/),
      idea: expect.stringMatching(/^#/),
      agreement: expect.stringMatching(/^#/),
      disagreement: expect.stringMatching(/^#/),
      supernovaCore: expect.stringMatching(/^#/),
      unknown: expect.stringMatching(/^#/),
    })
    expect(SCENE_COLORS.agreement).not.toBe(SCENE_COLORS.disagreement)
  })

  it('uses responsive budgets for all three background layers', () => {
    const desktop = getSceneQuality({ width: 1_440, height: 1_000 })
    const mobile = getSceneQuality({ width: 390, height: 844 })

    expect(mobile.distantStarCount).toBeLessThan(desktop.distantStarCount)
    expect(mobile.midStarCount).toBeLessThan(desktop.midStarCount)
    expect(mobile.foregroundDustCount).toBeLessThan(
      desktop.foregroundDustCount,
    )
    expect(mobile.visibleIdeaOrbitLimit).toBeLessThan(
      desktop.visibleIdeaOrbitLimit,
    )
    expect(desktop.distantStarCount).toBeGreaterThan(2_000)
    expect(desktop.foregroundDustCount).toBeLessThan(desktop.midStarCount)
    expect(BACKGROUND_VISUAL_CONFIG.distantOpacity).toBeGreaterThan(0)
  })

  it('keeps overview landmarks bounded and removes them on mobile', () => {
    const bounds = calculateGalaxyBounds([
      { x: -8, y: -4, z: -2 },
      { x: 8, y: 4, z: 2 },
    ])
    const desktop = getSceneQuality({ width: 1_440, height: 1_000 })
    const mobile = getSceneQuality({ width: 390, height: 844 })
    const landmarks = createSupernovaLandmarks(bounds, desktop.supernovaCount)

    expect(landmarks).toEqual(
      createSupernovaLandmarks(bounds, desktop.supernovaCount),
    )
    expect(landmarks).toHaveLength(2)
    expect(landmarks.every((landmark) => landmark.position.z < bounds.min.z))
      .toBe(true)
    expect(createSupernovaLandmarks(bounds, mobile.supernovaCount)).toEqual([])
  })

  it('freezes supernova pulsing for reduced or disabled motion', () => {
    const base = SUPERNOVA_VISUAL_CONFIG.shellOpacity
    const speed = SUPERNOVA_VISUAL_CONFIG.pulseSpeed

    expect(supernovaShellOpacityAtTime(7, true, true, base, speed)).toBe(base)
    expect(supernovaShellOpacityAtTime(7, false, false, base, speed)).toBe(base)
    expect(supernovaShellOpacityAtTime(7, true, false, base, speed)).not.toBe(
      base,
    )
  })
})

describe('local idea orbits and explicit relation budgets', () => {
  const orbit = createIdeaOrbit('philosopher-a', 'idea-a', 2)

  it('creates deterministic tilted elliptical orbit parameters', () => {
    expect(orbit).toEqual(createIdeaOrbit('philosopher-a', 'idea-a', 2))
    expect(orbit.radiusX).not.toBeCloseTo(orbit.radiusY, 3)
    expect(orbit.radiusZ).toBeGreaterThan(0)
  })

  it('moves only when motion is permitted', () => {
    const frozen = ideaOrbitAngleAtTime(orbit, 20, true)
    const moving = ideaOrbitAngleAtTime(orbit, 20, false)

    expect(frozen).toBe(orbit.phase)
    expect(moving).not.toBe(orbit.phase)
    expect(ideaOrbitPositionAtAngle(orbit, frozen)).toEqual(
      ideaOrbitPositionAtAngle(orbit, orbit.phase),
    )
  })

  it('caps the initial and expanded relationship web', () => {
    expect(RELATION_EDGE_BUDGETS.initialPerKind).toBe(3)
    expect(relationLimitForExpandedState(false)).toBe(3)
    expect(relationLimitForExpandedState(true) * 2).toBe(
      RELATION_EDGE_BUDGETS.expandedTotal,
    )
  })

  it('distinguishes agreement and disagreement by shape and motion', () => {
    expect(RELATION_EDGE_STYLES.agreement).toEqual({
      continuous: true,
      directionalMarker: false,
    })
    expect(RELATION_EDGE_STYLES.disagreement).toEqual({
      continuous: false,
      directionalMarker: false,
    })
    expect(RELATION_VISUAL_CONFIG.disagreementDash).toBeGreaterThan(0)
    expect(RELATION_VISUAL_CONFIG.agreementWidth).toBeGreaterThan(0)
  })

  it('does not infer a relationship from category metadata', () => {
    const idea = normalizeKeyIdea({
      ...rawOwnedKeyIdeaDetailFixture,
      agreeingKeyIdeas: [],
      disagreeingKeyIdeas: [],
    })

    expect(idea.categoryAbbreviations.length).toBeGreaterThan(0)
    expect(idea.agreeingKeyIdeaIds).toEqual([])
    expect(idea.disagreeingKeyIdeaIds).toEqual([])
  })
})

describe('stable camera modes and usable controls', () => {
  const bounds = calculateGalaxyBounds([
    { x: -8, y: -4, z: -2 },
    { x: 8, y: 4, z: 2 },
  ])
  const desktopQuality = getSceneQuality({ width: 1_440, height: 1_000 })
  const overview = calculateOverviewCamera(
    bounds,
    { width: 1_440, height: 1_000 },
    desktopQuality.overviewPadding,
  )
  const philosopher = { x: 2, y: 1, z: 0.5 }
  const idea = { x: 3.2, y: 0.8, z: 0.9 }

  beforeEach(() => {
    useExperienceStore.setState({
      labelsVisible: true,
      eraGuidesVisible: true,
      connectionsVisible: true,
      backgroundMotionEnabled: true,
    })
  })

  it('keeps the overview target at the galaxy center with strict bounds', () => {
    const camera = createGalaxyCameraState(
      'galaxy-overview',
      overview,
      desktopQuality,
      null,
      null,
    )

    expect(camera.target).toEqual(bounds.center)
    expect(camera.minDistance).toBeLessThan(camera.distance)
    expect(camera.maxDistance).toBeGreaterThan(camera.distance)
  })

  it('targets the selected philosopher and selected idea independently', () => {
    const philosopherCamera = createGalaxyCameraState(
      'philosopher-focus',
      overview,
      desktopQuality,
      philosopher,
      null,
    )
    const ideaCamera = createGalaxyCameraState(
      'idea-focus',
      overview,
      desktopQuality,
      philosopher,
      idea,
    )

    expect(philosopherCamera.target).toEqual(philosopher)
    expect(ideaCamera.target).toEqual(idea)
    expect(ideaCamera.mode).toBe('idea-focus')
  })

  it('uses a mobile focus envelope without cursor-targeted dolly', () => {
    const mobileQuality = getSceneQuality({ width: 390, height: 844 })
    const camera = createGalaxyCameraState(
      'philosopher-focus',
      overview,
      mobileQuality,
      philosopher,
      null,
    )

    expect(camera.target.y).toBe(
      philosopher.y + mobileQuality.selectedTargetOffsetY,
    )
    expect(camera.distance).toBe(mobileQuality.selectionDistance)
    expect(CAMERA_CONTROL_CONFIG.dollyToCursor).toBe(false)
  })

  it('exposes the compact background-motion and relation controls', () => {
    render(
      <SceneControls
        hasSelection
        onReset={() => undefined}
      />,
    )

    expect(screen.getByRole('button', { name: 'Links' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const motion = screen.getByRole('button', { name: 'Motion' })
    expect(motion).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(motion)
    expect(screen.getByRole('button', { name: 'Motion' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
