import { describe, expect, it } from 'vitest'

import { normalizeKeyIdea, normalizePhilosopherSummary } from '@/api/philosophers'
import {
  historicalCurvePoint,
  historicalPathProgress,
  sampleHistoricalCurve,
} from '@/features/galaxy/layout/historical-curve'
import { createIdeaNodes } from '@/features/galaxy/layout/idea-system'
import {
  philosopherPortraitUrl,
  philosopherThumbnailUrl,
} from '@/features/galaxy/layout/portrait'
import {
  rawAgreeingKeyIdeaFixture,
  rawDisagreeingKeyIdeaFixture,
  rawOwnedKeyIdeaDetailFixture,
  rawOwnedKeyIdeaFixture,
  rawPhilosopherFixture,
} from './fixtures/philosophers-api'

describe('authored historical curve', () => {
  it('returns exactly the same point for the same progress', () => {
    expect(historicalCurvePoint(0.63)).toEqual(historicalCurvePoint(0.63))
  })

  it('is curved rather than a disguised horizontal axis', () => {
    const [start, middle, end] = [
      historicalCurvePoint(0),
      historicalCurvePoint(0.5),
      historicalCurvePoint(1),
    ]
    const firstSlope = (middle.y - start.y) / (middle.x - start.x)
    const secondSlope = (end.y - middle.y) / (end.x - middle.x)

    expect(firstSlope).not.toBeCloseTo(secondSlope, 2)
    expect(sampleHistoricalCurve()).toHaveLength(97)
  })

  it('preserves historical order along the path scalar', () => {
    const progress = [-600, -1, 500, 1_200, 1_650, 1_900, 2_000].map(
      historicalPathProgress,
    )
    expect(progress).toEqual([...progress].sort((a, b) => a - b))
    expect(new Set(progress).size).toBe(progress.length)
  })
})

describe('API-backed idea systems', () => {
  it('maps philosopher-to-key-idea nodes without changing ownership', () => {
    const keyIdea = normalizeKeyIdea(rawOwnedKeyIdeaFixture)
    const [node] = createIdeaNodes([keyIdea], { x: 1, y: 2, z: 3 })

    expect(node.idea.philosopherId).toBe(rawPhilosopherFixture.id)
    expect(node.relation).toBe('owner')
  })

  it('maps only the API explicit agreement IDs', () => {
    const keyIdea = normalizeKeyIdea(rawOwnedKeyIdeaDetailFixture)
    expect(keyIdea.agreeingKeyIdeaIds).toEqual([
      rawAgreeingKeyIdeaFixture.id,
    ])
  })

  it('maps only the API explicit disagreement IDs', () => {
    const keyIdea = normalizeKeyIdea(rawOwnedKeyIdeaDetailFixture)
    expect(keyIdea.disagreeingKeyIdeaIds).toEqual([
      rawDisagreeingKeyIdeaFixture.id,
    ])
  })

  it('does not infer relationships from shared category metadata', () => {
    const keyIdea = normalizeKeyIdea({
      ...rawOwnedKeyIdeaDetailFixture,
      agreeingKeyIdeas: [],
      disagreeingKeyIdeas: [],
    })
    expect(keyIdea.categoryAbbreviations).toContain('on')
    expect(keyIdea.agreeingKeyIdeaIds).toEqual([])
    expect(keyIdea.disagreeingKeyIdeaIds).toEqual([])
  })
})

describe('progressive portrait resolution', () => {
  it('prefers a thumbnail for transient scene identity', () => {
    const philosopher = normalizePhilosopherSummary({
      ...rawPhilosopherFixture,
      images: {
        ...rawPhilosopherFixture.images,
        thumbnailIllustrations: {
          thumbnailIll150x150: '/Images/Adam-Smith-small.png',
        },
      },
    })
    expect(philosopherThumbnailUrl(philosopher)).toContain('small.png')
  })

  it('prefers a face portrait for the selected detail state', () => {
    const philosopher = normalizePhilosopherSummary(rawPhilosopherFixture)
    expect(philosopherPortraitUrl(philosopher)).toContain('Adam-SmithFace.jpg')
  })
})
