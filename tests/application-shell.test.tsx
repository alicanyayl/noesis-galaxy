import { createMemoryHistory } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from '@/App'
import { createAppRouter } from '@/app/router'
import { useExperienceStore } from '@/stores/experience-store'

vi.mock('@/features/galaxy/components/galaxy-canvas', () => ({
  GalaxyCanvas: () => <div data-testid="galaxy-canvas" />,
}))

vi.mock('@/features/data-diagnostics/components/data-diagnostics', () => ({
  DataDiagnostics: () => <div data-testid="data-diagnostics" />,
}))

function renderRoute(path = '/') {
  const history = createMemoryHistory({ initialEntries: [path] })
  return render(<App appRouter={createAppRouter(history)} />)
}

describe('Noesis Galaxy application shell', () => {
  beforeEach(() => {
    useExperienceStore.setState({ mode: 'intro' })
  })

  it('renders the project heading and tagline', async () => {
    renderRoute()

    expect(
      await screen.findByRole('heading', { name: 'Noesis Galaxy' }),
    ).toBeVisible()
    expect(
      screen.getByText(
        'Explore philosophy across time, ideas, and contradictions.',
      ),
    ).toBeVisible()
  })

  it('provides an accessible primary action', async () => {
    renderRoute()

    expect(
      await screen.findByRole('button', { name: 'Enter the preview' }),
    ).toBeEnabled()
  })

  it('changes the experience mode through the primary action', async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.click(
      await screen.findByRole('button', { name: 'Enter the preview' }),
    )

    expect(
      screen.getByRole('button', { name: 'Return to intro' }),
    ).toBeVisible()
    expect(
      screen.getByText(
        'A small field of stars is online. The journey itself comes next.',
      ),
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
