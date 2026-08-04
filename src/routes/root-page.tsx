import { ArrowRight, Orbit } from 'lucide-react'
import { useReducedMotion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { DataDiagnostics } from '@/features/data-diagnostics/components/data-diagnostics'
import { GalaxyCanvas } from '@/features/galaxy/components/galaxy-canvas'
import { useExperienceStore } from '@/stores/experience-store'

export function RootPage() {
  const mode = useExperienceStore((state) => state.mode)
  const setMode = useExperienceStore((state) => state.setMode)
  const prefersReducedMotion = useReducedMotion() ?? false
  const isExploring = mode === 'explore'

  return (
    <main className="relative isolate min-h-svh overflow-x-hidden bg-background text-foreground">
      <div className="absolute inset-0 -z-20">
        <GalaxyCanvas
          isActive={isExploring}
          reducedMotion={prefersReducedMotion}
        />
      </div>
      <div
        className="galaxy-atmosphere absolute inset-0 -z-10"
        aria-hidden="true"
      />

      <div className="pointer-events-none mx-auto flex min-h-svh w-full max-w-[96rem] flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
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
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/65 px-3 py-1.5 text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase"
            role="status"
          >
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Foundation preview
          </div>
        </header>

        <section
          className="grid flex-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:py-20"
          aria-labelledby="page-title"
        >
          <div className="pointer-events-auto max-w-2xl">
            <p className="mb-5 text-xs font-medium tracking-[0.24em] text-accent uppercase">
              Phase 0 · Coordinates established
            </p>
            <h1
              id="page-title"
              className="max-w-xl text-5xl leading-[0.96] font-medium tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl"
            >
              Noesis Galaxy
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/90 sm:text-xl sm:leading-9">
              Explore philosophy across time, ideas, and contradictions.
            </p>
            <p
              className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base"
              aria-live="polite"
            >
              {isExploring
                ? 'A small field of stars is online. The journey itself comes next.'
                : 'The universe is forming. This preview establishes the space future journeys will inhabit.'}
            </p>
            <Button
              className="mt-8 h-11 rounded-full border border-accent/30 bg-accent px-5 text-sm text-accent-foreground shadow-[0_12px_40px_-18px_var(--accent)] hover:bg-accent/90 focus-visible:ring-accent/50"
              onClick={() => setMode(isExploring ? 'intro' : 'explore')}
            >
              {isExploring ? 'Return to intro' : 'Enter the preview'}
              <ArrowRight
                className={
                  isExploring
                    ? 'rotate-180 transition-transform'
                    : 'transition-transform'
                }
                data-icon="inline-end"
                aria-hidden="true"
              />
            </Button>
          </div>
          <DataDiagnostics />
        </section>

        <footer className="pointer-events-auto flex flex-col gap-2 border-t border-border/70 pt-4 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Readable content remains available without WebGL.</p>
          <p>Move the pointer across the celestial core to test interaction.</p>
        </footer>
      </div>
    </main>
  )
}
