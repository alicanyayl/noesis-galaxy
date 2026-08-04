import type { z } from 'zod'

import {
  PHILOSOPHERS_API_BASE_URL,
  philosophersApiEndpoints,
} from './endpoints.ts'
import {
  normalizeCategory,
  normalizeKeyIdea,
  normalizePhilosopherDetail,
  normalizePhilosopherSummary,
  normalizeQuote,
} from './normalizers/entities.ts'
import {
  rawCategoryCollectionSchema,
  rawCategoryDetailSchema,
} from './schemas/category.ts'
import {
  rawKeyIdeaCollectionSchema,
  rawKeyIdeaDetailSchema,
} from './schemas/key-idea.ts'
import {
  rawPhilosopherCollectionSchema,
  rawPhilosopherDetailSchema,
} from './schemas/philosopher.ts'
import {
  rawQuoteCollectionSchema,
  rawQuoteDetailSchema,
} from './schemas/quote.ts'

export type PhilosophersApiErrorCode =
  | 'network'
  | 'timeout'
  | 'http'
  | 'invalid-json'
  | 'invalid-response'

export class PhilosophersApiError extends Error {
  readonly code: PhilosophersApiErrorCode
  readonly status: number | null

  constructor(
    code: PhilosophersApiErrorCode,
    message: string,
    options: { cause?: unknown; status?: number } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'PhilosophersApiError'
    this.code = code
    this.status = options.status ?? null
  }
}

interface RequestOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 10_000

function errorReason(value: unknown) {
  if (
    typeof value === 'object' &&
    value !== null &&
    'reason' in value &&
    typeof value.reason === 'string'
  ) {
    return value.reason
  }

  return null
}

export async function requestPhilosophersApi<Output>(
  path: string,
  schema: z.ZodType<Output>,
  options: RequestOptions = {},
): Promise<Output> {
  const controller = new AbortController()
  let timedOut = false
  const timeoutId = globalThis.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  const abortFromCaller = () => controller.abort(options.signal?.reason)

  if (options.signal?.aborted) {
    abortFromCaller()
  } else {
    options.signal?.addEventListener('abort', abortFromCaller, { once: true })
  }

  try {
    let response: Response

    try {
      response = await fetch(`${PHILOSOPHERS_API_BASE_URL}${path}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
    } catch (cause) {
      throw new PhilosophersApiError(
        timedOut ? 'timeout' : 'network',
        timedOut
          ? 'The Philosophers API request timed out.'
          : options.signal?.aborted
            ? 'The Philosophers API request was cancelled.'
            : 'The Philosophers API could not be reached.',
        { cause },
      )
    }

    const body = await response.text()
    let json: unknown

    try {
      json = JSON.parse(body)
    } catch (cause) {
      if (!response.ok) {
        throw new PhilosophersApiError(
          'http',
          `The Philosophers API returned HTTP ${response.status}.`,
          { cause, status: response.status },
        )
      }

      throw new PhilosophersApiError(
        'invalid-json',
        'The Philosophers API returned invalid JSON.',
        { cause, status: response.status },
      )
    }

    if (!response.ok) {
      const reason = errorReason(json)
      throw new PhilosophersApiError(
        'http',
        reason
          ? `The Philosophers API returned ${response.status}: ${reason}.`
          : `The Philosophers API returned HTTP ${response.status}.`,
        { status: response.status },
      )
    }

    const result = schema.safeParse(json)

    if (!result.success) {
      throw new PhilosophersApiError(
        'invalid-response',
        'The Philosophers API response did not match the validated data model.',
        { cause: result.error, status: response.status },
      )
    }

    return result.data
  } finally {
    globalThis.clearTimeout(timeoutId)
    options.signal?.removeEventListener('abort', abortFromCaller)
  }
}

export async function fetchPhilosophers(options?: RequestOptions) {
  const raw = await requestPhilosophersApi(
    philosophersApiEndpoints.philosophers,
    rawPhilosopherCollectionSchema,
    options,
  )
  return raw.map(normalizePhilosopherSummary)
}

export async function fetchPhilosopher(id: string, options?: RequestOptions) {
  const raw = await requestPhilosophersApi(
    philosophersApiEndpoints.philosopher(id),
    rawPhilosopherDetailSchema,
    options,
  )
  return normalizePhilosopherDetail(raw)
}

export async function fetchCategories(options?: RequestOptions) {
  const raw = await requestPhilosophersApi(
    philosophersApiEndpoints.categories,
    rawCategoryCollectionSchema,
    options,
  )
  return raw.map(normalizeCategory)
}

export async function fetchCategory(id: string, options?: RequestOptions) {
  const raw = await requestPhilosophersApi(
    philosophersApiEndpoints.category(id),
    rawCategoryDetailSchema,
    options,
  )
  return normalizeCategory(raw)
}

export async function fetchKeyIdeas(options?: RequestOptions) {
  const raw = await requestPhilosophersApi(
    philosophersApiEndpoints.keyIdeas,
    rawKeyIdeaCollectionSchema,
    options,
  )
  return raw.map(normalizeKeyIdea)
}

export async function fetchKeyIdea(id: string, options?: RequestOptions) {
  const raw = await requestPhilosophersApi(
    philosophersApiEndpoints.keyIdea(id),
    rawKeyIdeaDetailSchema,
    options,
  )
  return normalizeKeyIdea(raw)
}

export async function fetchQuotes(options?: RequestOptions) {
  const raw = await requestPhilosophersApi(
    philosophersApiEndpoints.quotes,
    rawQuoteCollectionSchema,
    options,
  )
  return raw.map(normalizeQuote)
}

export async function fetchQuote(id: string, options?: RequestOptions) {
  const raw = await requestPhilosophersApi(
    philosophersApiEndpoints.quote(id),
    rawQuoteDetailSchema,
    options,
  )
  return normalizeQuote(raw)
}
