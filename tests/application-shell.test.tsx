import { createMemoryHistory } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '@/App'
import { createAppQueryClient } from '@/app/query-client'
import { createAppRouter } from '@/app/router'
import { useExperienceStore } from '@/stores/experience-store'
import { rawPhilosopherFixture } from './fixtures/philosophers-api'

vi.mock('@/features/galaxy/components/galaxy-canvas', () => ({
  GalaxyCanvas: () => <div data-testid="galaxy-canvas" />,
}))

vi.mock('@/features/data-diagnostics/components/data-diagnostics', () => ({
  DataDiagnostics: () => <div data-testid="data-diagnostics" />,
}))

function renderRoute(path = '/') {
  const history = createMemoryHistory({ initialEntries: [path] })
  return render(
    <App
      appRouter={createAppRouter(history)}
      queryClient={createAppQueryClient()}
    />,
  )
}

describe('Noesis Galaxy application shell', () => {
  beforeEach(() => {
    useExperienceStore.setState({
      mode: 'intro',
      hoveredPhilosopherId: null,
      labelsVisible: true,
      eraGuidesVisible: true,
      connectionsVisible: true,
      cameraResetRequest: 0,
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([rawPhilosopherFixture]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the project heading and tagline', async () => {
    renderRoute()

    expect(
      await screen.findByRole('heading', { name: 'Follow the arc of thought' }),
    ).toBeVisible()
    expect(
      screen.getByText(/A living cosmos of thinkers/),
    ).toBeVisible()
  })

  it('renders a not-found page for an unknown route', async () => {
    renderRoute('/unknown-coordinate')

    expect(
      await screen.findByRole('heading', {
        name: 'This path has no coordinates.',
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Return to the foundation' }),
    ).toHaveAttribute('href', '/')
  })
})
