import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AlertCircle, LoaderCircle, Orbit } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { lazy, Suspense, useCallback, useState } from 'react'

import { philosophersQueryOptions } from '@/api/philosophers'
import { Button } from '@/components/ui/button'
import { AccessiblePhilosopherList } from '@/features/galaxy/components/accessible-philosopher-list'
import { EraLegend } from '@/features/galaxy/components/era-legend'
import { PhilosopherSummaryPanel } from '@/features/galaxy/components/philosopher-summary'
import { SceneControls } from '@/features/galaxy/components/scene-controls'
import { useGalaxyPhilosophers } from '@/features/galaxy/hooks/use-galaxy-philosophers'
import { useExperienceStore } from '@/stores/experience-store'

const GalaxyCanvas = lazy(() =>
  import('@/features/galaxy/components/galaxy-canvas').then((module) => ({
    default: module.GalaxyCanvas,
  })),
)

const DevelopmentDataDiagnostics = import.meta.env.DEV
  ? lazy(() =>
      import('@/features/data-diagnostics/components/data-diagnostics').then(
        (module) => ({ default: module.DataDiagnostics }),
      ),
    )
  : null

function DevelopmentDiagnostics() {
  const [open, setOpen] = useState(false)

  if (!DevelopmentDataDiagnostics) {
    return null
  }

  return (
    <details
      className="pointer-events-auto w-full max-w-md rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer font-medium text-foreground">
        Phase 1 data diagnostics
      </summary>
      {open ? (
        <Suspense fallback={<p className="py-3">Loading diagnostics…</p>}>
          <div className="mt-3 [&>aside]:max-w-none [&>aside]:border-0 [&>aside]:bg-transparent [&>aside]:p-0 [&>aside]:shadow-none">
            <DevelopmentDataDiagnostics />
          </div>
        </Suspense>
      ) : null}
    </details>
  )
}

function SceneLoadFallback() {
  return (
    <div className="grid h-full place-items-center" role="status">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/65 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md">
        <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        Loading historical scene…
      </span>
    </div>
  )
}

export function HistoricalGalaxyExperience() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const philosophersQuery = useQuery(philosophersQueryOptions())
  const philosophers = philosophersQuery.data ?? []
  const nodes = useGalaxyPhilosophers(philosophers)
  const requestedPhilosopherId = search.philosopher?.trim() || null
  const selectedPhilosopher =
    philosophers.find(
      (philosopher) => philosopher.id === requestedPhilosopherId,
    ) ?? null
  const invalidSelectionId =
    philosophersQuery.isSuccess && requestedPhilosopherId && !selectedPhilosopher
      ? requestedPhilosopherId
      : null
  const prefersReducedMotion = useReducedMotion() ?? false
  const mode = useExperienceStore((state) => state.mode)
  const setMode = useExperienceStore((state) => state.setMode)
  const requestCameraReset = useExperienceStore(
    (state) => state.requestCameraReset,
  )
  const isActive = mode === 'explore'

  const selectPhilosopher = useCallback(
    (id: string) => {
      void navigate({ search: { philosopher: id } })
      setMode('explore')
    },
    [navigate, setMode],
  )

  const clearSelection = useCallback(() => {
    void navigate({ search: {} })
    requestCameraReset()
  }, [navigate, requestCameraReset])

  const resetView = useCallback(() => {
    clearSelection()
    setMode('intro')
  }, [clearSelection, setMode])

  return (
    <main className="relative isolate min-h-svh overflow-x-hidden bg-background text-foreground">
      <div className="fixed inset-0 -z-20">
        <Suspense fallback={<SceneLoadFallback />}>
          <GalaxyCanvas
            active={isActive}
            nodes={nodes}
            selectedPhilosopherId={selectedPhilosopher?.id ?? null}
            onSelect={selectPhilosopher}
            reducedMotion={prefersReducedMotion}
          />
        </Suspense>
      </div>
      <div className="galaxy-atmosphere fixed inset-0 -z-10" aria-hidden="true" />

      <div className="pointer-events-none mx-auto flex min-h-svh w-full max-w-[100rem] flex-col px-4 py-4 sm:px-7 sm:py-6 lg:px-10">
        <header className="pointer-events-auto flex items-center justify-between gap-4">
          <a
            className="inline-flex items-center gap-2.5 rounded-md text-sm font-medium tracking-[0.04em] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/"
            aria-label="Noesis Galaxy home"
          >
            <span className="grid size-7 place-items-center rounded-full border border-accent/30 bg-surface/70 text-accent">
              <Orbit className="size-3.5" aria-hidden="true" />
            </span>
            <span>Noesis Galaxy</span>
          </a>
          <div
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/70 px-3 py-1.5 text-[0.65rem] font-medium tracking-[0.14em] text-muted-foreground uppercase backdrop-blur-md"
            role="status"
          >
            <span
              className={`size-1.5 rounded-full ${
                philosophersQuery.isSuccess ? 'bg-accent' : 'bg-muted-foreground'
              }`}
              aria-hidden="true"
            />
            {philosophersQuery.isPending
              ? 'Loading data'
              : philosophersQuery.isError
                ? 'Data unavailable'
                : `${philosophers.length} nodes online`}
          </div>
        </header>

        <div className="mt-8 flex flex-1 flex-col justify-between gap-10 pb-4 sm:mt-12">
          <div className="flex flex-col items-start gap-5">
            <section
              className="pointer-events-auto max-w-xl rounded-2xl border border-border/70 bg-background/58 p-4 backdrop-blur-lg sm:p-5"
              aria-labelledby="page-title"
            >
              <p className="text-[0.68rem] font-medium tracking-[0.2em] text-accent uppercase">
                Phase 2 · Historical galaxy
              </p>
              <h1
                id="page-title"
                className="mt-2 text-3xl font-medium tracking-[-0.045em] sm:text-4xl"
              >
                Philosophy across time
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-foreground/80 sm:text-base sm:leading-7">
                Move left to right from antiquity toward the present. Vertical
                and depth clustering reflects shared school metadata—not direct
                influence.
              </p>
            </section>
            <div className="pointer-events-auto max-w-xl">
              <EraLegend />
            </div>

            {philosophersQuery.isPending ? (
              <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-2 text-sm text-muted-foreground backdrop-blur-md" role="status">
                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Validating philosopher coordinates…
              </div>
            ) : null}

            {philosophersQuery.isError ? (
              <div className="pointer-events-auto max-w-md rounded-xl border border-destructive/35 bg-background/80 p-4 backdrop-blur-md" role="alert">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-4 text-destructive" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Historical data unavailable</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      The scene shell remains available, but philosopher nodes
                      could not be validated.
                    </p>
                  </div>
                </div>
                <Button className="mt-3 rounded-full" size="sm" variant="outline" onClick={() => void philosophersQuery.refetch()}>
                  Retry data
                </Button>
              </div>
            ) : null}

            {philosophersQuery.isSuccess && philosophers.length === 0 ? (
              <p className="pointer-events-auto rounded-xl border border-border bg-background/75 p-4 text-sm text-muted-foreground" role="status">
                The API returned no validated philosophers to position.
              </p>
            ) : null}
          </div>

          <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
            <div className="flex flex-col items-start gap-3">
              <div className="pointer-events-auto flex flex-wrap gap-2">
                <SceneControls
                  active={isActive}
                  hasSelection={selectedPhilosopher !== null}
                  onReset={resetView}
                  onToggleActive={() =>
                    setMode(isActive ? 'intro' : 'explore')
                  }
                />
                <AccessiblePhilosopherList
                  philosophers={philosophers}
                  selectedPhilosopherId={selectedPhilosopher?.id ?? null}
                  onSelect={selectPhilosopher}
                  disabled={!philosophersQuery.isSuccess || philosophers.length === 0}
                />
              </div>
              <p className="pointer-events-auto max-w-2xl text-[0.7rem] leading-5 text-muted-foreground">
                Drag to orbit, scroll or pinch to zoom, and select a node to
                focus. Era boundaries are broad orientation aids, not claims of
                academic consensus.
              </p>
              <DevelopmentDiagnostics />
            </div>

            <div className="justify-self-end">
              <PhilosopherSummaryPanel
                philosopher={selectedPhilosopher}
                invalidSelectionId={invalidSelectionId}
                onClose={clearSelection}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
