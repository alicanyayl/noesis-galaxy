import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import {
  fetchPhilosophers,
  PhilosophersApiError,
  requestPhilosophersApi,
} from '@/api/philosophers'
import { rawPhilosopherFixture } from './fixtures/philosophers-api'

describe('Philosophers API errors', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a typed HTTP error with the response status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: true, reason: 'Not Found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const request = requestPhilosophersApi('/missing', z.object({}))

    await expect(request).rejects.toMatchObject({
      name: 'PhilosophersApiError',
      code: 'http',
      status: 404,
    } satisfies Partial<PhilosophersApiError>)
  })

  it('excludes an isolated invalid philosopher without hiding valid records', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([rawPhilosopherFixture, { id: 'malformed' }]),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    )

    await expect(fetchPhilosophers()).resolves.toMatchObject([
      { id: rawPhilosopherFixture.id, name: 'Adam Smith' },
    ])
  })
})
