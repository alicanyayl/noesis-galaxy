import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import {
  PhilosophersApiError,
  requestPhilosophersApi,
} from '@/api/philosophers'

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
})
