import { mapHistoricalYearToX, UNKNOWN_YEAR_X } from './historical-axis'

export type HistoricalEraId =
  | 'ancient'
  | 'medieval'
  | 'early-modern'
  | 'modern'
  | 'contemporary'
  | 'unknown'

export interface HistoricalEra {
  id: HistoricalEraId
  label: string
  description: string
  color: string
  minimumYear: number | null
  maximumYear: number | null
  guideYear: number | null
}

export const HISTORICAL_ERAS: readonly HistoricalEra[] = [
  {
    id: 'ancient',
    label: 'Ancient',
    description: 'Before 500 CE',
    color: '#89aab8',
    minimumYear: null,
    maximumYear: 499,
    guideYear: -250,
  },
  {
    id: 'medieval',
    label: 'Medieval',
    description: '500–1499 CE',
    color: '#929db7',
    minimumYear: 500,
    maximumYear: 1_499,
    guideYear: 1_000,
  },
  {
    id: 'early-modern',
    label: 'Early modern',
    description: '1500–1799 CE',
    color: '#a79cb9',
    minimumYear: 1_500,
    maximumYear: 1_799,
    guideYear: 1_650,
  },
  {
    id: 'modern',
    label: 'Modern',
    description: '1800–1944 CE',
    color: '#b49cad',
    minimumYear: 1_800,
    maximumYear: 1_944,
    guideYear: 1_872,
  },
  {
    id: 'contemporary',
    label: 'Contemporary',
    description: '1945 CE onward',
    color: '#b9aa96',
    minimumYear: 1_945,
    maximumYear: null,
    guideYear: 2_010,
  },
  {
    id: 'unknown',
    label: 'Unknown date',
    description: 'Birth year unavailable',
    color: '#858b96',
    minimumYear: null,
    maximumYear: null,
    guideYear: null,
  },
] as const

export const ERA_BOUNDARY_YEARS = [500, 1_500, 1_800, 1_945] as const

export function classifyHistoricalEra(year: number | null) {
  if (year === null || !Number.isFinite(year)) {
    return HISTORICAL_ERAS[5]
  }

  if (year < 500) return HISTORICAL_ERAS[0]
  if (year < 1_500) return HISTORICAL_ERAS[1]
  if (year < 1_800) return HISTORICAL_ERAS[2]
  if (year < 1_945) return HISTORICAL_ERAS[3]
  return HISTORICAL_ERAS[4]
}

export function getEraGuideX(era: HistoricalEra) {
  return era.id === 'unknown'
    ? UNKNOWN_YEAR_X
    : mapHistoricalYearToX(era.guideYear)
}
