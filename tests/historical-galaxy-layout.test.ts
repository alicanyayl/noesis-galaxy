import { describe, expect, it } from 'vitest'

import {
  parseHistoricalYear,
  type PhilosopherSummary,
} from '@/api/philosophers'
import { normalizePhilosopherSummary } from '@/api/philosophers/normalizers/entities.ts'
import { classifyHistoricalEra } from '@/features/galaxy/layout/eras'
import {
  mapHistoricalYearToX,
  UNKNOWN_YEAR_X,
} from '@/features/galaxy/layout/historical-axis'
import {
  formatPhilosopherLifespan,
} from '@/features/galaxy/layout/lifespan'
import { createPhilosopherGalaxyPosition } from '@/features/galaxy/layout/philosopher-position'
import { rawPhilosopherFixture } from './fixtures/philosophers-api'

function philosopher(
  id: string,
  overrides: Partial<PhilosopherSummary> = {},
) {
  return {
    ...normalizePhilosopherSummary({ ...rawPhilosopherFixture, id }),
    ...overrides,
  }
}

describe('historical axis', () => {
  it('preserves chronological ordering', () => {
    const positions = [-800, -1, 1, 500, 1_500, 1_900, 2_050].map(
      mapHistoricalYearToX,
    )

    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(new Set(positions).size).toBe(positions.length)
  })

  it('maps BCE years before CE years', () => {
    expect(mapHistoricalYearToX(-470)).toBeLessThan(
      mapHistoricalYearToX(470),
    )
  })

  it('compresses dense modern periods without reversing them', () => {
    const modernGap = mapHistoricalYearToX(2_000) - mapHistoricalYearToX(1_900)
    const centralGap = mapHistoricalYearToX(1_100) - mapHistoricalYearToX(1_000)

    expect(modernGap).toBeGreaterThan(0)
    expect(modernGap).toBeLessThan(centralGap)
  })

  it('places unknown years in the designated uncertainty region', () => {
    expect(mapHistoricalYearToX(null)).toBe(UNKNOWN_YEAR_X)
    expect(mapHistoricalYearToX(Number.NaN)).toBe(UNKNOWN_YEAR_X)
  })
})

describe('deterministic school layout', () => {
  const first = philosopher('00000000-0000-4000-8000-000000000001')
  const second = philosopher('00000000-0000-4000-8000-000000000002')

  it('returns identical coordinates for the same philosopher', () => {
    expect(createPhilosopherGalaxyPosition(first)).toEqual(
      createPhilosopherGalaxyPosition(first),
    )
  })

  it('gives different philosopher IDs different local offsets', () => {
    expect(createPhilosopherGalaxyPosition(first)).not.toEqual(
      createPhilosopherGalaxyPosition(second),
    )
  })

  it('keeps philosophers in the same school within one cluster region', () => {
    const firstPosition = createPhilosopherGalaxyPosition(first)
    const secondPosition = createPhilosopherGalaxyPosition(second)

    expect(Math.abs(firstPosition.y - secondPosition.y)).toBeLessThanOrEqual(1.16)
    expect(Math.abs(firstPosition.z - secondPosition.z)).toBeLessThanOrEqual(1.24)
  })

  it('keeps unknown-school placement stable without stacking every node', () => {
    const unknownFirst = { ...first, school: null }
    const unknownSecond = { ...second, school: null }

    expect(createPhilosopherGalaxyPosition(unknownFirst)).toEqual(
      createPhilosopherGalaxyPosition(unknownFirst),
    )
    expect(createPhilosopherGalaxyPosition(unknownFirst)).not.toEqual(
      createPhilosopherGalaxyPosition(unknownSecond),
    )
  })
})

describe('historical eras', () => {
  it.each([
    [-1, 'ancient'],
    [499, 'ancient'],
    [500, 'medieval'],
    [1_499, 'medieval'],
    [1_500, 'early-modern'],
    [1_799, 'early-modern'],
    [1_800, 'modern'],
    [1_944, 'modern'],
    [1_945, 'contemporary'],
    [null, 'unknown'],
  ] as const)('classifies %s as %s', (year, era) => {
    expect(classifyHistoricalEra(year).id).toBe(era)
  })
})

describe('lifespan formatting', () => {
  it('formats a living philosopher', () => {
    expect(
      formatPhilosopherLifespan(
        parseHistoricalYear('1930 AD'),
        parseHistoricalYear('Present'),
      ),
    ).toBe('1930 – Present')
  })

  it('formats a BCE lifespan', () => {
    expect(
      formatPhilosopherLifespan(
        parseHistoricalYear('470 BC'),
        parseHistoricalYear('399 BC'),
      ),
    ).toBe('470 BCE – 399 BCE')
  })
})
