import { HISTORICAL_ERAS } from '@/features/galaxy/layout/eras'

export function EraLegend() {
  return (
    <section
      className="galaxy-era-legend inline-flex rounded-full border border-border/45 bg-background/30 px-2.5 py-1.5 backdrop-blur-md"
      aria-labelledby="era-legend-title"
    >
      <h2 id="era-legend-title" className="sr-only">
        Historical direction
      </h2>
      <ol className="flex items-center gap-2.5">
        {HISTORICAL_ERAS.filter((era) => era.id !== 'unknown').map((era) => (
          <li
            key={era.id}
            className="inline-flex items-center gap-1 text-[0.56rem] tracking-[0.08em] text-foreground/55 uppercase"
            title={era.description}
          >
            <span
              className="size-1 rounded-full shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: era.color, color: era.color }}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">{era.label}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
