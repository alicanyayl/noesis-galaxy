import { historicalYearSchema, type HistoricalYear } from '../schemas/common.ts'

const HISTORICAL_YEAR_PATTERN = /^(\d+)\s*(BC|BCE|AD|CE)$/i

export function parseHistoricalYear(value?: string | null): HistoricalYear {
  const original = value?.trim() || null

  if (!original) {
    return historicalYearSchema.parse({
      original: null,
      numeric: null,
      era: 'unknown',
    })
  }

  if (original.toLowerCase() === 'present') {
    return historicalYearSchema.parse({
      original,
      numeric: null,
      era: 'present',
    })
  }

  if (original.toLowerCase() === 'unknown') {
    return historicalYearSchema.parse({
      original,
      numeric: null,
      era: 'unknown',
    })
  }

  const match = HISTORICAL_YEAR_PATTERN.exec(original)

  if (!match) {
    return historicalYearSchema.parse({
      original,
      numeric: null,
      era: 'unknown',
    })
  }

  const year = Number(match[1])
  const rawEra = match[2].toUpperCase()

  if (!Number.isSafeInteger(year) || year === 0) {
    return historicalYearSchema.parse({
      original,
      numeric: null,
      era: 'unknown',
    })
  }

  const isBce = rawEra === 'BC' || rawEra === 'BCE'

  return historicalYearSchema.parse({
    original,
    numeric: isBce ? -year : year,
    era: isBce ? 'BCE' : 'CE',
  })
}
