import { queryOptions } from '@tanstack/react-query'

import {
  fetchCategories,
  fetchKeyIdea,
  fetchPhilosopher,
  fetchPhilosophers,
  PhilosophersApiError,
} from './client.ts'

const COLLECTION_STALE_TIME = 30 * 60 * 1_000
const DETAIL_STALE_TIME = 60 * 60 * 1_000

export const philosophersQueryKeys = {
  all: ['philosophers-api'] as const,
  philosophers: () => [...philosophersQueryKeys.all, 'philosophers'] as const,
  philosopher: (id: string) =>
    [...philosophersQueryKeys.philosophers(), 'detail', id] as const,
  categories: () => [...philosophersQueryKeys.all, 'categories'] as const,
  keyIdeas: () => [...philosophersQueryKeys.all, 'key-ideas'] as const,
  keyIdea: (id: string) =>
    [...philosophersQueryKeys.keyIdeas(), 'detail', id] as const,
}

function retryTransientFailure(failureCount: number, error: Error) {
  return (
    failureCount < 2 &&
    error instanceof PhilosophersApiError &&
    (error.code === 'network' || error.code === 'timeout')
  )
}

export function philosophersQueryOptions() {
  return queryOptions({
    queryKey: philosophersQueryKeys.philosophers(),
    queryFn: ({ signal }) => fetchPhilosophers({ signal }),
    staleTime: COLLECTION_STALE_TIME,
    retry: retryTransientFailure,
  })
}

export function philosopherQueryOptions(id: string) {
  return queryOptions({
    queryKey: philosophersQueryKeys.philosopher(id),
    queryFn: ({ signal }) => fetchPhilosopher(id, { signal }),
    enabled: id.length > 0,
    staleTime: DETAIL_STALE_TIME,
    retry: retryTransientFailure,
  })
}

export function categoriesQueryOptions() {
  return queryOptions({
    queryKey: philosophersQueryKeys.categories(),
    queryFn: ({ signal }) => fetchCategories({ signal }),
    staleTime: COLLECTION_STALE_TIME,
    retry: retryTransientFailure,
  })
}

export function keyIdeaQueryOptions(id: string) {
  return queryOptions({
    queryKey: philosophersQueryKeys.keyIdea(id),
    queryFn: ({ signal }) => fetchKeyIdea(id, { signal }),
    enabled: id.length > 0,
    staleTime: DETAIL_STALE_TIME,
    retry: retryTransientFailure,
  })
}
