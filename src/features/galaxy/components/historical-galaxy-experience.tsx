import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AlertCircle, Orbit } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { philosophersQueryOptions } from '@/api/philosophers'
import { Button } from '@/components/ui/button'
import { AccessiblePhilosopherList } from '@/features/galaxy/components/accessible-philosopher-list'
import { EraLegend } from '@/features/galaxy/components/era-legend'
import { SceneControls } from '@/features/galaxy/components/scene-controls'
import { SceneLoadingState } from '@/features/galaxy/components/scene-loading-state'
import { useGalaxyPhilosophers } from '@/features/galaxy/hooks/use-galaxy-philosophers'
import { usePhilosopherIdeaSystem } from '@/features/galaxy/hooks/use-philosopher-idea-system'
import { classifyHistoricalEra } from '@/features/galaxy/layout/eras'
import { MAX_VISIBLE_IDEAS } from '@/features/galaxy/layout/idea-system'
import { relationLimitForExpandedState } from '@/features/galaxy/layout/relationship-budgets'
import type { GalaxyTelemetry } from '@/features/galaxy/types/galaxy'
import { useExperienceStore } from '@/stores/experience-store'

const GalaxyCanvas = lazy(() =>
  import('@/features/galaxy/components/galaxy-canvas').then((module) => ({
    default: module.GalaxyCanvas,
  })),
)

const PhilosopherSummaryPanel = lazy(() =>
  import('@/features/galaxy/components/philosopher-summary').then((module) => ({
    default: module.PhilosopherSummaryPanel,
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
      className="galaxy-diagnostics pointer-events-auto hidden w-full max-w-md rounded-xl border border-border/60 bg-background/55 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md sm:block"
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

export function HistoricalGalaxyExperience() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const philosophersQuery = useQuery(philosophersQueryOptions())
  const philosophers = philosophersQuery.data ?? []
  const nodes = useGalaxyPhilosophers(philosophers)
  const [telemetry, setTelemetry] = useState<GalaxyTelemetry | null>(null)
  const [visibleIdeaLimit, setVisibleIdeaLimit] = useState(MAX_VISIBLE_IDEAS)
  const [relationsExpanded, setRelationsExpanded] = useState(false)
  const requestedPhilosopherId = search.philosopher?.trim() || null
  const selectedPhilosopher =
    philosophers.find(
      (philosopher) => philosopher.id === requestedPhilosopherId,
    ) ?? null
  const requestedIdeaId = selectedPhilosopher
    ? search.idea?.trim() || null
    : null
  const invalidSelectionId =
    philosophersQuery.isSuccess && requestedPhilosopherId && !selectedPhilosopher
      ? requestedPhilosopherId
      : null
  const ideaSystem = usePhilosopherIdeaSystem(
    selectedPhilosopher?.id ?? null,
    requestedIdeaId,
    visibleIdeaLimit,
    relationLimitForExpandedState(relationsExpanded),
  )
  const prefersReducedMotion = useReducedMotion() ?? false
  const mode = useExperienceStore((state) => state.mode)
  const setMode = useExperienceStore((state) => state.setMode)
  const requestCameraReset = useExperienceStore(
    (state) => state.requestCameraReset,
  )
  const isActive = mode === 'explore'
  const sceneReady =
    telemetry !== null &&
    nodes.length > 0 &&
    telemetry.philosopherCount === nodes.length

  const selectPhilosopher = useCallback(
    (id: string) => {
      setVisibleIdeaLimit(MAX_VISIBLE_IDEAS)
      setRelationsExpanded(false)
      void navigate({ search: { philosopher: id } })
      setMode('explore')
    },
    [navigate, setMode],
  )

  const selectIdea = useCallback(
    (id: string) => {
      if (!selectedPhilosopher) return
      setRelationsExpanded(false)
      void navigate({
        search: { philosopher: selectedPhilosopher.id, idea: id },
      })
    },
    [navigate, selectedPhilosopher],
  )

  const selectRelatedIdea = useCallback(
    (philosopherId: string, ideaId: string) => {
      setVisibleIdeaLimit(MAX_VISIBLE_IDEAS)
      setRelationsExpanded(false)
      void navigate({ search: { philosopher: philosopherId, idea: ideaId } })
      setMode('explore')
    },
    [navigate, setMode],
  )

  const backToPhilosopher = useCallback(() => {
    if (!selectedPhilosopher) return
    void navigate({ search: { philosopher: selectedPhilosopher.id } })
  }, [navigate, selectedPhilosopher])

  const clearSelection = useCallback(() => {
    void navigate({ search: {} })
    requestCameraReset()
  }, [navigate, requestCameraReset])

  const resetView = useCallback(() => {
    clearSelection()
    setMode('explore')
  }, [clearSelection, setMode])

  const handleTelemetry = useCallback((nextTelemetry: GalaxyTelemetry) => {
    setTelemetry(nextTelemetry)
    if (import.meta.env.DEV || import.meta.env.VITE_E2E === 'true') {
      window.__NOESIS_GALAXY_TELEMETRY__ = nextTelemetry
    }
  }, [])

  useEffect(
    () => () => {
      if (import.meta.env.DEV || import.meta.env.VITE_E2E === 'true') {
        delete window.__NOESIS_GALAXY_TELEMETRY__
      }
    },
    [],
  )

  const currentEra = selectedPhilosopher
    ? classifyHistoricalEra(selectedPhilosopher.birthYear.numeric).label
    : 'Ancient core → contemporary frontier'

  return (
    <main
      className="relative isolate min-h-svh overflow-x-hidden bg-background text-foreground"
      data-reduced-motion={prefersReducedMotion}
      data-scene-ready={sceneReady}
      data-focus-mode={requestedIdeaId ? 'idea' : selectedPhilosopher ? 'philosopher' : 'galaxy'}
    >
      <div className="fixed inset-0 -z-20">
        <Suspense fallback={null}>
          <GalaxyCanvas
            active={isActive}
            nodes={nodes}
            selectedPhilosopherId={selectedPhilosopher?.id ?? null}
            selectedIdeaId={ideaSystem.selectedIdea?.id ?? requestedIdeaId}
            ideaSystem={ideaSystem}
            onSelect={selectPhilosopher}
            onSelectIdea={selectIdea}
            onSelectRelatedIdea={selectRelatedIdea}
            onTelemetry={handleTelemetry}
            reducedMotion={prefersReducedMotion}
          />
        </Suspense>
      </div>
      <div className="galaxy-atmosphere fixed inset-0 -z-10" aria-hidden="true" />

      {!sceneReady && !philosophersQuery.isError ? (
        <SceneLoadingState
          philosopherCount={
            philosophersQuery.isSuccess ? philosophers.length : undefined
          }
        />
      ) : null}

      {sceneReady ? (
        <p className="sr-only" role="status" data-testid="scene-ready-status">
          Galaxy scene ready: {telemetry.philosopherCount} philosophers
          positioned.
        </p>
      ) : null}

      <div className="pointer-events-none relative z-20 mx-auto flex min-h-svh w-full max-w-[110rem] flex-col px-3 py-3 sm:px-6 sm:py-5 lg:px-8">
        <header className="pointer-events-auto flex items-center justify-between gap-3">
          <a
            className="inline-flex items-center gap-2 rounded-md text-xs font-medium tracking-[0.06em] outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
            href="/"
            aria-label="Noesis Galaxy home"
          >
            <span className="grid size-6 place-items-center rounded-full border border-accent/30 bg-surface/55 text-accent shadow-[0_0_20px_rgba(168,178,255,0.14)]">
              <Orbit className="size-3.5" aria-hidden="true" />
            </span>
            <span>Noesis Galaxy</span>
          </a>
          <div
            className="inline-flex items-center gap-2 rounded-full border border-border/55 bg-surface/45 px-2.5 py-1 text-[0.55rem] font-medium tracking-[0.13em] text-muted-foreground uppercase backdrop-blur-md"
            role="status"
          >
            <span
              className={`size-1.5 rounded-full ${
                philosophersQuery.isSuccess
                  ? 'bg-accent shadow-[0_0_10px_currentColor]'
                  : 'bg-muted-foreground'
              }`}
              aria-hidden="true"
            />
            {philosophersQuery.isPending
              ? 'Mapping history'
              : philosophersQuery.isError
                ? 'Data unavailable'
                : currentEra}
          </div>
        </header>

        <div className="mt-4 flex flex-1 flex-col justify-between gap-5 sm:mt-6">
          <div className="flex max-w-xs flex-col items-start gap-2">
            <section
              className={`galaxy-intro pointer-events-auto rounded-2xl border border-border/35 bg-background/35 px-3 py-2.5 backdrop-blur-lg sm:px-3.5${selectedPhilosopher ? ' hidden' : ''}`}
              aria-labelledby="page-title"
            >
              <p className="text-[0.63rem] font-medium tracking-[0.2em] text-accent uppercase">
                Living atlas · Historical galaxy
              </p>
              <h1
                id="page-title"
                className="mt-1 text-lg font-medium tracking-[-0.04em] sm:text-xl"
              >
                Follow the arc of thought
              </h1>
              <p className="mt-1.5 max-w-xs text-[0.68rem] leading-4 text-foreground/62 sm:text-xs sm:leading-5">
                A living cosmos of thinkers, ordered from the ancient core to
                the contemporary frontier.
              </p>
            </section>
            <div
              className={`pointer-events-auto${selectedPhilosopher ? ' hidden' : ''}`}
            >
              <EraLegend />
            </div>

            {philosophersQuery.isError ? (
              <div className="pointer-events-auto max-w-md rounded-xl border border-destructive/35 bg-background/88 p-4 backdrop-blur-md" role="alert">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Historical data unavailable</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      The archive could not be validated. The interface remains
                      available and the request can be retried.
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

          <div className="grid items-end gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,21rem)]">
            <div className="flex flex-col items-start gap-2.5">
              <div className="pointer-events-auto flex flex-wrap gap-2">
                <SceneControls
                  hasSelection={selectedPhilosopher !== null}
                  onReset={resetView}
                />
                <AccessiblePhilosopherList
                  philosophers={philosophers}
                  selectedPhilosopherId={selectedPhilosopher?.id ?? null}
                  onSelect={selectPhilosopher}
                  disabled={!philosophersQuery.isSuccess || philosophers.length === 0}
                />
              </div>
              <p className="sr-only">
                Drag to orbit, scroll or pinch to zoom, hover or tap a luminous
                thinker, and reset to return to the complete historical span.
              </p>
              <DevelopmentDiagnostics />
            </div>

            <div className="galaxy-summary-slot justify-self-end">
              <Suspense fallback={null}>
                <PhilosopherSummaryPanel
                  philosopher={selectedPhilosopher}
                  invalidSelectionId={invalidSelectionId}
                  ideaSystem={ideaSystem}
                  onBackToPhilosopher={backToPhilosopher}
                  onClose={clearSelection}
                  onExpandIdeas={() =>
                    setVisibleIdeaLimit(ideaSystem.totalIdeaCount)
                  }
                  onExpandRelations={() => setRelationsExpanded(true)}
                  onSelectIdea={selectIdea}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
