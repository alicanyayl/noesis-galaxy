import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DataDiagnostics } from '@/features/data-diagnostics/components/data-diagnostics'
import {
  rawCategoryFixture,
  rawPhilosopherFixture,
} from './fixtures/philosophers-api'

function renderDiagnostics(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  )
}

describe('Phase 1 data diagnostics', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders validated collection metrics', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((input: string) => {
        const body = input.endsWith('/categories')
          ? [rawCategoryFixture]
          : [rawPhilosopherFixture]
        return Promise.resolve(
          new Response(JSON.stringify(body), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      }),
    )

    renderDiagnostics(<DataDiagnostics />)

    expect(
      await screen.findByText('Connected and validated'),
    ).toBeVisible()
    expect(screen.getByText('1723 CE – 1790 CE')).toBeVisible()
    expect(screen.getByText('1 of 1')).toBeVisible()
  })

  it('renders an understandable error with a retry action', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: true, reason: 'Unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    renderDiagnostics(<DataDiagnostics />)

    expect(
      await screen.findByText('API connection unavailable'),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled()
  })
})
