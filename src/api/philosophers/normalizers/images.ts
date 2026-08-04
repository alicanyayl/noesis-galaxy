import { PHILOSOPHERS_API_ORIGIN } from '../endpoints.ts'
import type {
  RawCategory,
} from '../schemas/category.ts'
import type { RawPhilosopherSummary } from '../schemas/philosopher.ts'

type GroupedImages = RawPhilosopherSummary['images']
type FlatImages = RawCategory['images']

export function resolvePhilosophersApiAsset(value: string): string | null {
  const path = value.trim()

  if (!path || path.startsWith('//') || path.includes('\\')) {
    return null
  }

  try {
    const url = new URL(path, `${PHILOSOPHERS_API_ORIGIN}/`)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export function normalizeGroupedImages(images: GroupedImages) {
  return Object.fromEntries(
    Object.entries(images).flatMap(([group, references]) =>
      Object.entries(references).map(([name, path]) => [
        `${group}.${name}`,
        resolvePhilosophersApiAsset(path),
      ]),
    ),
  )
}

export function normalizeFlatImages(images: FlatImages) {
  return Object.fromEntries(
    Object.entries(images).map(([name, path]) => [
      name,
      resolvePhilosophersApiAsset(path),
    ]),
  )
}
