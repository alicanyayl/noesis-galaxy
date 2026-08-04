import { Dialog } from '@base-ui/react/dialog'
import { List, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { PhilosopherSummary } from '@/api/philosophers'
import { buttonVariants } from '@/components/ui/button'
import { HISTORICAL_ERAS } from '@/features/galaxy/layout/eras'
import { classifyHistoricalEra } from '@/features/galaxy/layout/eras'
import { formatPhilosopherLifespan } from '@/features/galaxy/layout/lifespan'
import { cn } from '@/lib/utils'

interface AccessiblePhilosopherListProps {
  philosophers: PhilosopherSummary[]
  selectedPhilosopherId: string | null
  onSelect: (id: string) => void
  disabled?: boolean
}

export function AccessiblePhilosopherList({
  philosophers,
  selectedPhilosopherId,
  onSelect,
  disabled = false,
}: AccessiblePhilosopherListProps) {
  const [open, setOpen] = useState(false)
  const groups = useMemo(
    () =>
      HISTORICAL_ERAS.map((era) => ({
        era,
        philosophers: philosophers
          .filter(
            (philosopher) =>
              classifyHistoricalEra(philosopher.birthYear.numeric).id === era.id,
          )
          .sort((first, second) => {
            const firstYear = first.birthYear.numeric ?? Number.POSITIVE_INFINITY
            const secondYear = second.birthYear.numeric ?? Number.POSITIVE_INFINITY
            return firstYear - secondYear || first.name.localeCompare(second.name)
          }),
      })).filter((group) => group.philosophers.length > 0),
    [philosophers],
  )

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'h-9 rounded-full bg-background/55 backdrop-blur-md',
        )}
        disabled={disabled}
      >
        <List aria-hidden="true" />
        Explore accessible list
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-3 sm:p-6">
          <Dialog.Popup className="relative my-auto w-full max-w-3xl rounded-2xl border border-border bg-background p-5 shadow-2xl outline-none transition data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:p-7">
            <div className="pr-12">
              <Dialog.Title className="text-2xl font-medium tracking-tight">
                Philosophers through history
              </Dialog.Title>
              <Dialog.Description className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Browse the same normalized records shown in the galaxy. Groups
                are broad historical aids; school proximity does not imply
                direct influence.
              </Dialog.Description>
            </div>
            <Dialog.Close
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'absolute top-4 right-4 rounded-full',
              )}
              aria-label="Close philosopher list"
            >
              <X aria-hidden="true" />
            </Dialog.Close>

            <div className="mt-6 max-h-[65svh] space-y-7 overflow-y-auto pr-1">
              {groups.map(({ era, philosophers: eraPhilosophers }) => (
                <section key={era.id} aria-labelledby={`list-era-${era.id}`}>
                  <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/95 py-2 backdrop-blur">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: era.color }}
                      aria-hidden="true"
                    />
                    <h3
                      id={`list-era-${era.id}`}
                      className="text-sm font-medium"
                    >
                      {era.label}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {eraPhilosophers.length}
                    </span>
                  </div>
                  <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                    {eraPhilosophers.map((philosopher) => (
                      <li key={philosopher.id}>
                        <button
                          type="button"
                          className="w-full rounded-lg border border-transparent px-3 py-2.5 text-left outline-none transition hover:border-border hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring aria-[current=true]:border-accent/35 aria-[current=true]:bg-accent/10"
                          aria-current={
                            philosopher.id === selectedPhilosopherId
                              ? 'true'
                              : undefined
                          }
                          onClick={() => {
                            onSelect(philosopher.id)
                            setOpen(false)
                          }}
                        >
                          <span className="block text-sm font-medium">
                            {philosopher.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {formatPhilosopherLifespan(
                              philosopher.birthYear,
                              philosopher.deathYear,
                            )}
                            {' · '}
                            {philosopher.school ?? 'Unclassified'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
