import type { PhilosopherSummary } from '@/api/philosophers'
import { stableHash } from '@/features/galaxy/layout/deterministic-hash'
import type { PhilosopherNodeVariant } from '@/features/galaxy/types/galaxy'

export const NODE_VARIANT_METADATA_KEYS = [
  'birthYear.era',
  'deathYear.era',
  'school',
  'imageReferences',
] as const

/** Presentation variety only: variants never encode philosophical rank. */
export function createPhilosopherNodeVariant(
  philosopher: PhilosopherSummary,
): PhilosopherNodeVariant {
  if (
    philosopher.birthYear.era === 'unknown' ||
    philosopher.birthYear.numeric === null
  ) {
    return 'crystalline'
  }

  if (philosopher.deathYear.era === 'present') return 'corona'

  const hasImage = Object.values(philosopher.imageReferences).some(Boolean)
  const metadataKey = [
    philosopher.birthYear.era,
    philosopher.deathYear.era,
    philosopher.school ?? 'unclassified',
    hasImage ? 'portrait' : 'no-portrait',
  ].join(':')
  const variants = [
    'stellar',
    'ringed',
    'corona',
    'binary',
    'crystalline',
  ] as const

  return variants[stableHash(metadataKey) % variants.length]
}
