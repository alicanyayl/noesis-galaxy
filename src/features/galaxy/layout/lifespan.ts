import type { HistoricalYear } from '@/api/philosophers'

export function formatHistoricalYear(year: HistoricalYear) {
  if (year.era === 'present') return 'Present'
  if (year.era === 'unknown' || year.numeric === null) return 'Unknown'
  return year.era === 'BCE' ? `${Math.abs(year.numeric)} BCE` : `${year.numeric}`
}

export function formatPhilosopherLifespan(
  birthYear: HistoricalYear,
  deathYear: HistoricalYear,
) {
  const birth = formatHistoricalYear(birthYear)
  const death = formatHistoricalYear(deathYear)

  return `${birth} – ${death}`
}
