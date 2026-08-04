import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ExternalLink, LoaderCircle, MapPin, X } from 'lucide-react'
import { useState } from 'react'

import {
  PHILOSOPHERS_API_BASE_URL,
  philosopherQueryOptions,
  type PhilosopherSummary,
} from '@/api/philosophers'
import { Button } from '@/components/ui/button'
import { classifyHistoricalEra } from '@/features/galaxy/layout/eras'
import { formatPhilosopherLifespan } from '@/features/galaxy/layout/lifespan'

interface PhilosopherSummaryPanelProps {
  philosopher: PhilosopherSummary | null
  invalidSelectionId: string | null
  onClose: () => void
}

function portraitUrl(philosopher: PhilosopherSummary) {
  const preferredKeys = [
    'faceImages.face250x250',
    'faceImages.face500x500',
    'thumbnailIllustrations.thumbnailIll150x150',
    'illustrations.ill250x250',
  ]

  for (const key of preferredKeys) {
    const url = philosopher.imageReferences[key]
    if (url) return url
  }

  return (
    Object.entries(philosopher.imageReferences).find(
      ([key, url]) => !key.startsWith('fullImages.') && Boolean(url),
    )?.[1] ?? null
  )
}

function Portrait({ philosopher }: { philosopher: PhilosopherSummary }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const imageUrl = portraitUrl(philosopher)

  if (!imageUrl || failedUrl === imageUrl) {
    return (
      <div className="grid size-20 shrink-0 place-items-center rounded-2xl border border-border bg-muted text-xl font-medium text-muted-foreground">
        {philosopher.name
          .split(' ')
          .slice(0, 2)
          .map((part) => part[0])
          .join('')}
      </div>
    )
  }

  return (
    <img
      className="size-20 shrink-0 rounded-2xl border border-border object-cover"
      src={imageUrl}
      alt=""
      loading="eager"
      onError={() => setFailedUrl(imageUrl)}
    />
  )
}

export function PhilosopherSummaryPanel({
  philosopher,
  invalidSelectionId,
  onClose,
}: PhilosopherSummaryPanelProps) {
  const detailQuery = useQuery(philosopherQueryOptions(philosopher?.id ?? ''))

  if (invalidSelectionId) {
    return (
      <aside
        className="pointer-events-auto w-full max-w-sm rounded-2xl border border-destructive/35 bg-background/88 p-5 shadow-2xl backdrop-blur-xl"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <h2 className="font-medium">Philosopher not found</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              The shared selection does not match a validated philosopher
              record.
            </p>
          </div>
        </div>
        <Button className="mt-4 rounded-full" size="sm" variant="outline" onClick={onClose}>
          Clear selection
        </Button>
      </aside>
    )
  }

  if (!philosopher) {
    return null
  }

  const detail = detailQuery.data
  const era = classifyHistoricalEra(philosopher.birthYear.numeric)

  return (
    <aside
      className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border/80 bg-background/88 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl"
      aria-labelledby="selected-philosopher-title"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <Portrait philosopher={detail ?? philosopher} />
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-medium tracking-[0.16em] text-accent uppercase">
            {era.label} · Selected
          </p>
          <h2
            id="selected-philosopher-title"
            className="mt-1 text-xl font-medium tracking-tight"
          >
            {philosopher.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatPhilosopherLifespan(
              philosopher.birthYear,
              philosopher.deathYear,
            )}
          </p>
        </div>
        <Button
          className="-mt-1 -mr-1 rounded-full"
          size="icon"
          variant="ghost"
          onClick={onClose}
          aria-label="Close philosopher summary"
        >
          <X aria-hidden="true" />
        </Button>
      </div>

      <dl className="mt-5 grid gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">School cluster</dt>
          <dd className="mt-0.5 font-medium">
            {philosopher.school ?? 'Unclassified'}
          </dd>
        </div>
        {detail?.birthLocationName ? (
          <div>
            <dt className="text-muted-foreground">Recorded birthplace</dt>
            <dd className="mt-0.5 inline-flex items-center gap-1.5 font-medium">
              <MapPin className="size-3.5" aria-hidden="true" />
              {detail.birthLocationName}
            </dd>
          </div>
        ) : null}
        {detail ? (
          <div>
            <dt className="text-muted-foreground">Validated key ideas</dt>
            <dd className="mt-0.5 font-medium tabular-nums">
              {detail.keyIdeaIds.length}
            </dd>
          </div>
        ) : null}
      </dl>

      {(detail ?? philosopher).topicalDescription ? (
        <p className="mt-4 border-t border-border/70 pt-4 text-sm leading-6 text-foreground/80">
          {(detail ?? philosopher).topicalDescription}
        </p>
      ) : null}

      {detailQuery.isFetching ? (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground" role="status">
          <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          Loading selected record…
        </p>
      ) : null}

      {detailQuery.isError ? (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs leading-5 text-muted-foreground" role="alert">
          Selected details could not be loaded. The validated collection summary
          remains available.
          <button
            className="ml-1 font-medium text-foreground underline underline-offset-2"
            type="button"
            onClick={() => void detailQuery.refetch()}
          >
            Retry
          </button>
        </div>
      ) : null}

      <a
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        href={`${PHILOSOPHERS_API_BASE_URL}/philosophers/${encodeURIComponent(philosopher.id)}`}
        target="_blank"
        rel="noreferrer"
      >
        View API data source
        <ExternalLink className="size-3" aria-hidden="true" />
      </a>
    </aside>
  )
}
