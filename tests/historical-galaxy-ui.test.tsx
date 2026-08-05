import { createMemoryHistory } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '@/App'
import { createAppQueryClient } from '@/app/query-client'
import { createAppRouter } from '@/app/router'
import { useExperienceStore } from '@/stores/experience-store'
import {
  rawPhilosopherDetailFixture,
  rawPhilosopherFixture,
  rawAgreeingKeyIdeaFixture,
  rawDisagreeingKeyIdeaFixture,
  rawOwnedKeyIdeaDetailFixture,
  rawOwnedKeyIdeaFixture,
} from './fixtures/philosophers-api'

vi.mock('@/features/galaxy/components/galaxy-canvas', () => ({
  GalaxyCanvas: () => (
    <div role="status">WebGL unavailable in this test environment.</div>
  ),
}))

function mockPhilosophersApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((input: string) => {
      const pathname = new URL(input).pathname
      const payload = pathname.endsWith('/api/philosophers')
        ? [rawPhilosopherFixture]
        : pathname.endsWith('/api/keyideas')
          ? [
              rawOwnedKeyIdeaFixture,
              rawAgreeingKeyIdeaFixture,
              rawDisagreeingKeyIdeaFixture,
            ]
          : pathname.includes('/api/keyideas/')
            ? rawOwnedKeyIdeaDetailFixture
            : rawPhilosopherDetailFixture

      return Promise.resolve(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }),
  )
}

function renderRoute(path = '/') {
  const history = createMemoryHistory({ initialEntries: [path] })
  const router = createAppRouter(history)
  render(
    <App appRouter={router} queryClient={createAppQueryClient()} />,
  )
  return router
}

describe('historical galaxy URL and accessible exploration', () => {
  beforeEach(() => {
    useExperienceStore.setState({
      mode: 'intro',
      hoveredPhilosopherId: null,
      labelsVisible: true,
      eraGuidesVisible: true,
      connectionsVisible: true,
      cameraResetRequest: 0,
    })
    mockPhilosophersApi()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('restores a valid philosopher selection from the URL', async () => {
    renderRoute(`/?philosopher=${rawPhilosopherFixture.id}`)

    expect(
      await screen.findByRole('heading', { name: 'Adam Smith' }),
    ).toBeVisible()
    expect(screen.getByText('1723 – 1790')).toBeVisible()
  })

  it('restores a selected key idea from the URL', async () => {
    renderRoute(
      `/?philosopher=${rawPhilosopherFixture.id}&idea=${rawOwnedKeyIdeaFixture.id}`,
    )

    expect(await screen.findByTestId('selected-idea-detail')).toBeVisible()
    expect(screen.getByTestId('selected-idea-detail')).toHaveTextContent(
      'Mind and matter are distinct kinds of substance.',
    )
    expect(screen.getByText('1 continuous agreements')).toBeVisible()
    expect(screen.getByText('1 interrupted disagreements')).toBeVisible()
  })

  it('handles an invalid philosopher URL selection safely', async () => {
    renderRoute('/?philosopher=not-a-philosopher')

    expect(await screen.findByText('Philosopher not found')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Clear selection' }),
    ).toBeEnabled()
  })

  it('renders normalized names and dates in the accessible list', async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.click(
      await screen.findByRole('button', {
        name: 'Explore accessible list',
      }),
    )

    expect(
      screen.getByRole('heading', { name: 'Philosophers through history' }),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: /Adam Smith/ })).toHaveTextContent(
      '1723 – 1790',
    )
  })

  it('selects a philosopher from the accessible list and updates the URL summary', async () => {
    const user = userEvent.setup()
    const router = renderRoute()

    await user.click(
      await screen.findByRole('button', {
        name: 'Explore accessible list',
      }),
    )
    await user.click(screen.getByRole('button', { name: /Adam Smith/ }))

    expect(
      await screen.findByRole('heading', { name: 'Adam Smith' }),
    ).toBeVisible()
    expect(router.state.location.search).toMatchObject({
      philosopher: rawPhilosopherFixture.id,
    })
  })

  it('clears selection and URL state with the reset action', async () => {
    const user = userEvent.setup()
    const router = renderRoute(`/?philosopher=${rawPhilosopherFixture.id}`)

    expect(
      await screen.findByRole('heading', { name: 'Adam Smith' }),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Reset' }))

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Adam Smith' }),
      ).not.toBeInTheDocument()
      expect(router.state.location.search).toEqual({})
    })
  })

  it('returns from idea focus to philosopher focus before clearing the galaxy', async () => {
    const user = userEvent.setup()
    const router = renderRoute(
      `/?philosopher=${rawPhilosopherFixture.id}&idea=${rawOwnedKeyIdeaFixture.id}`,
    )

    await user.click(
      await screen.findByRole('button', { name: 'Back to philosopher' }),
    )
    await waitFor(() => {
      expect(router.state.location.search).toEqual({
        philosopher: rawPhilosopherFixture.id,
      })
    })
    expect(screen.queryByTestId('selected-idea-detail')).not.toBeInTheDocument()
  })

  it('keeps the accessible list usable when the WebGL view falls back', async () => {
    const user = userEvent.setup()
    renderRoute()

    expect(
      await screen.findByText('WebGL unavailable in this test environment.'),
    ).toBeVisible()
    await user.click(
      screen.getByRole('button', { name: 'Explore accessible list' }),
    )

    expect(screen.getByRole('button', { name: /Adam Smith/ })).toBeEnabled()
  })
})
