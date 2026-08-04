import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Check, Database, LoaderCircle, RefreshCw } from 'lucide-react'

import {
  categoriesQueryOptions,
  philosophersQueryOptions,
  type PhilosopherSummary,
} from '@/api/philosophers'
import { Button } from '@/components/ui/button'

function formatYear(year: number) {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`
}

function getYearRange(philosophers: PhilosopherSummary[]) {
  const years = philosophers.flatMap((philosopher) =>
    [philosopher.birthYear.numeric, philosopher.deathYear.numeric].filter(
      (year): year is number => year !== null,
    ),
  )

  if (years.length === 0) {
    return 'Unknown'
  }

  return `${formatYear(Math.min(...years))} – ${formatYear(Math.max(...years))}`
}

function countRecordsWithImages(philosophers: PhilosopherSummary[]) {
  return philosophers.filter((philosopher) =>
    Object.values(philosopher.imageReferences).some(Boolean),
  ).length
}

export function DataDiagnostics() {
  const philosophersQuery = useQuery(philosophersQueryOptions())
  const categoriesQuery = useQuery(categoriesQueryOptions())
  const isLoading =
    philosophersQuery.isPending || categoriesQuery.isPending
  const error = philosophersQuery.error ?? categoriesQuery.error
  const philosophers = philosophersQuery.data ?? []
  const categories = categoriesQuery.data ?? []

  const retry = () => {
    void Promise.all([
      philosophersQuery.refetch(),
      categoriesQuery.refetch(),
    ])
  }

  return (
    <aside
      className="pointer-events-auto w-full max-w-md justify-self-end rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6"
      aria-labelledby="data-diagnostics-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-medium tracking-[0.18em] text-accent uppercase">
            Live foundation check
          </p>
          <h2
            id="data-diagnostics-title"
            className="mt-2 text-lg font-medium tracking-tight"
          >
            Phase 1 Data Diagnostics
          </h2>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background/55 text-accent">
          <Database className="size-4" aria-hidden="true" />
        </span>
      </div>

      {isLoading ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground" role="status">
          <LoaderCircle
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          Validating the official API…
        </div>
      ) : error ? (
        <div className="mt-6" role="alert">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">API connection unavailable</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                The galaxy remains usable. Try the data check again when the
                connection recovers.
              </p>
            </div>
          </div>
          <Button
            className="mt-4 rounded-full"
            size="sm"
            variant="outline"
            onClick={retry}
          >
            <RefreshCw aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground" role="status">
            <span className="grid size-5 place-items-center rounded-full bg-accent/15 text-accent">
              <Check className="size-3" aria-hidden="true" />
            </span>
            Connected and validated
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Philosophers</dt>
              <dd className="mt-1 text-lg font-medium tabular-nums">
                {philosophers.length}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Categories</dt>
              <dd className="mt-1 text-lg font-medium tabular-nums">
                {categories.length}
              </dd>
            </div>
            <div className="col-span-2 border-t border-border/70 pt-4">
              <dt className="text-muted-foreground">Normalized year span</dt>
              <dd className="mt-1 font-medium tabular-nums">
                {getYearRange(philosophers)}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Records with images</dt>
              <dd className="mt-1 font-medium tabular-nums">
                {countRecordsWithImages(philosophers)} of {philosophers.length}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </aside>
  )
}
