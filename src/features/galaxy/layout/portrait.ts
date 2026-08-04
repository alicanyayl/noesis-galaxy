import type { PhilosopherSummary } from '@/api/philosophers'

const THUMBNAIL_KEYS = [
  'thumbnailIllustrations.thumbnailIll150x150',
  'thumbnailIllustrations.thumbnailIll100x100',
  'faceImages.face250x250',
  'illustrations.ill250x250',
] as const

const DETAIL_KEYS = [
  'faceImages.face500x500',
  'faceImages.face250x250',
  'illustrations.ill500x500',
  'illustrations.ill250x250',
] as const

function firstImage(
  philosopher: PhilosopherSummary,
  keys: readonly string[],
) {
  for (const key of keys) {
    const url = philosopher.imageReferences[key]
    if (url) return url
  }

  return (
    Object.entries(philosopher.imageReferences).find(
      ([key, url]) => !key.startsWith('fullImages.') && Boolean(url),
    )?.[1] ?? null
  )
}

export function philosopherThumbnailUrl(philosopher: PhilosopherSummary) {
  return firstImage(philosopher, THUMBNAIL_KEYS)
}

export function philosopherPortraitUrl(philosopher: PhilosopherSummary) {
  return firstImage(philosopher, DETAIL_KEYS)
}

export function philosopherInitials(philosopher: PhilosopherSummary) {
  return philosopher.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}
