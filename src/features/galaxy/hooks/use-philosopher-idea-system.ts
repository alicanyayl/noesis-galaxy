import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import {
  keyIdeaQueryOptions,
  keyIdeasQueryOptions,
  philosopherQueryOptions,
} from '@/api/philosophers'
import {
  MAX_VISIBLE_IDEAS,
  MAX_VISIBLE_RELATIONS_PER_KIND,
} from '@/features/galaxy/layout/idea-system'
import type { GalaxyIdeaSystem } from '@/features/galaxy/types/galaxy'

export function usePhilosopherIdeaSystem(
  philosopherId: string | null,
  selectedIdeaId: string | null,
  visibleIdeaLimit = MAX_VISIBLE_IDEAS,
) {
  const philosopherQuery = useQuery(
    philosopherQueryOptions(philosopherId ?? ''),
  )
  const ideasQuery = useQuery({
    ...keyIdeasQueryOptions(),
    enabled: Boolean(philosopherId),
  })
  const selectedIdeaQuery = useQuery(
    keyIdeaQueryOptions(selectedIdeaId ?? ''),
  )

  return useMemo<GalaxyIdeaSystem>(() => {
    const allIdeas = ideasQuery.data ?? []
    const detailIdeaIds = philosopherQuery.data?.keyIdeaIds ?? []
    const selectedIdeaBelongsToPhilosopher =
      selectedIdeaId !== null && detailIdeaIds.includes(selectedIdeaId)
    const visibleIds = new Set(detailIdeaIds.slice(0, visibleIdeaLimit))

    if (selectedIdeaBelongsToPhilosopher && selectedIdeaId) {
      visibleIds.add(selectedIdeaId)
    }

    const ideas = allIdeas
      .filter((idea) => visibleIds.has(idea.id))
      .sort(
        (first, second) =>
          (first.order ?? Number.MAX_SAFE_INTEGER) -
            (second.order ?? Number.MAX_SAFE_INTEGER) ||
          first.text.localeCompare(second.text),
      )
    const selectedIdea = selectedIdeaBelongsToPhilosopher
      ? (selectedIdeaQuery.data ??
        ideas.find((idea) => idea.id === selectedIdeaId) ??
        null)
      : null
    const ideasById = new Map(allIdeas.map((idea) => [idea.id, idea]))

    return {
      ideas,
      totalIdeaCount: detailIdeaIds.length,
      selectedIdea,
      agreeingIdeas: (selectedIdea?.agreeingKeyIdeaIds ?? [])
        .map((id) => ideasById.get(id))
        .filter((idea) => idea !== undefined)
        .slice(0, MAX_VISIBLE_RELATIONS_PER_KIND),
      disagreeingIdeas: (selectedIdea?.disagreeingKeyIdeaIds ?? [])
        .map((id) => ideasById.get(id))
        .filter((idea) => idea !== undefined)
        .slice(0, MAX_VISIBLE_RELATIONS_PER_KIND),
      isLoading:
        philosopherQuery.isFetching ||
        ideasQuery.isFetching ||
        (selectedIdeaId !== null && selectedIdeaQuery.isFetching),
    }
  }, [
    ideasQuery.data,
    ideasQuery.isFetching,
    philosopherQuery.data?.keyIdeaIds,
    philosopherQuery.isFetching,
    selectedIdeaId,
    selectedIdeaQuery.data,
    selectedIdeaQuery.isFetching,
    visibleIdeaLimit,
  ])
}
