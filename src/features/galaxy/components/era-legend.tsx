import { HISTORICAL_ERAS } from '@/features/galaxy/layout/eras'

export function EraLegend() {
  return (
    <section
      className="rounded-xl border border-border/70 bg-background/50 px-3 py-2.5 backdrop-blur-md"
      aria-labelledby="era-legend-title"
    >
      <h2
        id="era-legend-title"
        className="text-[0.62rem] font-medium tracking-[0.16em] text-muted-foreground uppercase"
      >
        Historical eras
      </h2>
      <ul className="mt-2 flex max-w-xl flex-wrap gap-x-3 gap-y-1.5">
        {HISTORICAL_ERAS.map((era) => (
          <li
            key={era.id}
            className="inline-flex items-center gap-1.5 text-[0.68rem] text-foreground/75"
            title={era.description}
          >
            <span
              className="size-1.5 rounded-full ring-1 ring-white/15"
              style={{ backgroundColor: era.color }}
              aria-hidden="true"
            />
            {era.label}
          </li>
        ))}
      </ul>
    </section>
  )
}
