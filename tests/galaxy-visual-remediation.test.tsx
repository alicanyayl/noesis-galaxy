import { render, screen } from '@testing-library/react'
import { createMemoryHistory } from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from '@/App'
import { createAppQueryClient } from '@/app/query-client'
import { createAppRouter } from '@/app/router'
import { EraLegend } from '@/features/galaxy/components/era-legend'
import { SceneLoadingState } from '@/features/galaxy/components/scene-loading-state'
import { calculateGalaxyBounds } from '@/features/galaxy/layout/galaxy-bounds'
import { calculateOverviewCamera } from '@/features/galaxy/layout/overview-camera'
import { getSceneQuality } from '@/features/galaxy/scene/scene-quality'
import { NODE_VISUAL_CONFIG } from '@/features/galaxy/scene/scene-visuals'

vi.mock('@/features/galaxy/components/galaxy-canvas', () => ({
  GalaxyCanvas: () => <div data-testid="galaxy-canvas" />,
}))

describe('galaxy visual remediation geometry', () => {
  const bounds = calculateGalaxyBounds([
    { x: -9, y: -4, z: -2 },
    { x: 7, y: 5, z: 2 },
    { x: 1, y: 2, z: 0 },
  ])

  it('calculates complete galaxy bounds once from positioned nodes', () => {
    expect(bounds).toEqual({
      min: { x: -9, y: -4, z: -2 },
      max: { x: 7, y: 5, z: 2 },
      center: { x: -1, y: 0.5, z: 0 },
      size: { x: 16, y: 9, z: 4 },
    })
  })

  it('calculates a centered desktop overview from the real bounds', () => {
    const camera = calculateOverviewCamera(
      bounds,
      { width: 1_440, height: 900 },
      1.12,
    )

    expect(camera.target).toEqual(bounds.center)
    expect(camera.position.x).toBe(bounds.center.x)
    expect(camera.distance).toBeGreaterThan(bounds.size.x / 2)
    expect(camera.maxDistance).toBeGreaterThan(camera.distance)
  })

  it('fits the horizontal history on mobile without using a guessed distance', () => {
    const desktop = calculateOverviewCamera(
      bounds,
      { width: 1_440, height: 900 },
      1.12,
    )
    const mobile = calculateOverviewCamera(
      bounds,
      { width: 390, height: 844 },
      1.04,
    )

    expect(mobile.target).toEqual(bounds.center)
    expect(mobile.distance).toBeGreaterThan(desktop.distance)
    expect(mobile.far).toBeGreaterThan(mobile.distance * 3)
  })

  it('uses readable semantic-node sizing and strong selected emphasis', () => {
    expect(NODE_VISUAL_CONFIG.coreRadius).toBeGreaterThanOrEqual(0.07)
    expect(NODE_VISUAL_CONFIG.selectedScale).toBeGreaterThan(
      NODE_VISUAL_CONFIG.hoverScale,
    )
    expect(NODE_VISUAL_CONFIG.hoverScale).toBeGreaterThan(1)
    expect(NODE_VISUAL_CONFIG.selectedHaloOpacity).toBeGreaterThan(
      NODE_VISUAL_CONFIG.haloOpacity,
    )
  })

  it('centralizes responsive scene quality instead of scattering viewport checks', () => {
    const desktop = getSceneQuality({ width: 1_440, height: 900 })
    const tablet = getSceneQuality({ width: 1_024, height: 768 })
    const mobile = getSceneQuality({ width: 390, height: 844 })

    expect([desktop.viewportClass, tablet.viewportClass, mobile.viewportClass])
      .toEqual(['desktop', 'tablet', 'mobile'])
    expect(mobile.decorativeStarCount).toBeLessThan(
      desktop.decorativeStarCount,
    )
    expect(mobile.nodeScaleMultiplier).toBeGreaterThan(
      desktop.nodeScaleMultiplier,
    )
    expect(mobile.visibleSchoolLabelLimit).toBeLessThan(
      tablet.visibleSchoolLabelLimit,
    )
  })
})

describe('galaxy visual remediation interface', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the full historical direction with text labels', () => {
    render(<EraLegend />)

    expect(
      screen.getByRole('heading', { name: 'Historical direction' }),
    ).toBeVisible()
    expect(screen.getByText(/BCE.*CE/)).toBeVisible()
    expect(screen.getByText('Ancient')).toBeVisible()
    expect(screen.getByText('Contemporary')).toBeVisible()
  })

  it('renders an explanatory loading state without a fake percentage', () => {
    render(<SceneLoadingState philosopherCount={114} />)

    expect(
      screen.getByText('Positioning 114 thinkers across history'),
    ).toBeVisible()
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })

  it('renders a clear collection error and retry control', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ reason: 'Unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )
    const history = createMemoryHistory({ initialEntries: ['/'] })

    render(
      <App
        appRouter={createAppRouter(history)}
        queryClient={createAppQueryClient()}
      />,
    )

    expect(
      await screen.findByText('Historical data unavailable'),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'Retry data' })).toBeEnabled()
  })
})
