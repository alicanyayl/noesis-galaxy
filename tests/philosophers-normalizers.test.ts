import { describe, expect, it } from 'vitest'

import {
  normalizeCoordinates,
  parseHistoricalYear,
  rawKeyIdeaSchema,
  rawPhilosopherSummarySchema,
  resolvePhilosophersApiAsset,
} from '@/api/philosophers'
import {
  rawKeyIdeaFixture,
  rawPhilosopherFixture,
} from './fixtures/philosophers-api'

describe('historical year normalization', () => {
  it('parses a BCE year as a negative number', () => {
    expect(parseHistoricalYear('611 BC')).toEqual({
      original: '611 BC',
      numeric: -611,
      era: 'BCE',
    })
  })

  it.each([
    ['1724 AD', 1724],
    ['1905 CE', 1905],
  ])('parses %s as a CE year', (value, numeric) => {
    expect(parseHistoricalYear(value)).toEqual({
      original: value,
      numeric,
      era: 'CE',
    })
  })

  it('parses Present without inventing a numeric year', () => {
    expect(parseHistoricalYear('Present')).toEqual({
      original: 'Present',
      numeric: null,
      era: 'present',
    })
  })

  it.each([undefined, null, '', 'circa sometime', '0 AD'])(
    'handles missing or invalid input %s safely',
    (value) => {
      const result = parseHistoricalYear(value)
      expect(result.numeric).toBeNull()
      expect(result.era).toBe('unknown')
    },
  )
})

describe('image URL normalization', () => {
  it('resolves a relative API image path', () => {
    expect(resolvePhilosophersApiAsset('/Images/example.png')).toBe(
      'https://philosophersapi.com/Images/example.png',
    )
  })

  it('preserves an absolute HTTPS image URL', () => {
    expect(
      resolvePhilosophersApiAsset('https://cdn.example.com/image.png'),
    ).toBe('https://cdn.example.com/image.png')
  })

  it('rejects an unsafe image protocol', () => {
    expect(resolvePhilosophersApiAsset('javascript:alert(1)')).toBeNull()
  })
})

describe('coordinate normalization', () => {
  it('normalizes finite numeric strings', () => {
    expect(
      normalizeCoordinates({ latitude: '56.11073', longitude: '-3.16737' }),
    ).toEqual({ latitude: 56.11073, longitude: -3.16737 })
  })

  it.each([
    { latitude: 91, longitude: 0 },
    { latitude: 0, longitude: '-181' },
    { latitude: 'north', longitude: 0 },
  ])('rejects invalid coordinates %#', (coordinates) => {
    expect(normalizeCoordinates(coordinates)).toBeNull()
  })
})

describe('observed API fixtures', () => {
  it('parses a real philosopher summary shape', () => {
    expect(rawPhilosopherSummarySchema.parse(rawPhilosopherFixture).name).toBe(
      'Adam Smith',
    )
  })

  it('parses a real key-idea shape', () => {
    expect(rawKeyIdeaSchema.parse(rawKeyIdeaFixture).text).toContain(
      'composed of water',
    )
  })
})
