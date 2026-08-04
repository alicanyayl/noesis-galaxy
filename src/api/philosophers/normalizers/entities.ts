import type { RawCategory, RawCategoryDetail } from '../schemas/category.ts'
import { categorySchema } from '../schemas/category.ts'
import type { RawKeyIdea, RawKeyIdeaDetail } from '../schemas/key-idea.ts'
import { keyIdeaSchema } from '../schemas/key-idea.ts'
import type {
  RawPhilosopherDetail,
  RawPhilosopherSummary,
} from '../schemas/philosopher.ts'
import {
  philosopherDetailSchema,
  philosopherSummarySchema,
} from '../schemas/philosopher.ts'
import type { RawQuote, RawQuoteDetail } from '../schemas/quote.ts'
import { quoteSchema } from '../schemas/quote.ts'
import { normalizeCoordinates } from './coordinates.ts'
import { parseHistoricalYear } from './dates.ts'
import { normalizeFlatImages, normalizeGroupedImages } from './images.ts'

function nullableText(value?: string | null) {
  const text = value?.trim()
  return text ? text : null
}

function nullableUrl(value?: string | null) {
  const url = nullableText(value)

  if (!url) {
    return null
  }

  try {
    return new URL(url).toString()
  } catch {
    return null
  }
}

function normalizedOrder(value: string) {
  return /^\d+$/.test(value) ? Number(value) : null
}

export function normalizePhilosopherSummary(raw: RawPhilosopherSummary) {
  return philosopherSummarySchema.parse({
    id: raw.id,
    name: raw.name,
    username: raw.username,
    birthYear: parseHistoricalYear(raw.birthYear),
    deathYear: parseHistoricalYear(raw.deathYear),
    interests: raw.interests
      .split(',')
      .map((interest) => interest.trim())
      .filter(Boolean),
    school: nullableText(raw.school),
    life: raw.life,
    topicalDescription: nullableText(raw.topicalDescription),
    speLink: nullableUrl(raw.speLink),
    iepLink: nullableUrl(raw.iepLink),
    wikiTitle: raw.wikiTitle,
    hasEBooks: raw.hasEBooks,
    imageReferences: normalizeGroupedImages(raw.images),
    libriVoxIDs: raw.libriVoxIDs,
    libriVoxGetRequestLinks: raw.libriVoxGetRequestLinks,
  })
}

export function normalizePhilosopherDetail(raw: RawPhilosopherDetail) {
  const summary = normalizePhilosopherSummary(raw)

  return philosopherDetailSchema.parse({
    ...summary,
    birthDate: nullableText(raw.birthDate),
    deathDate: nullableText(raw.deathDate),
    birthLocationName: nullableText(raw.birthLocation?.name),
    coordinates: normalizeCoordinates(raw.birthLocation),
    works: raw.works.map((work) => ({
      id: work.id,
      title: work.title,
      link: nullableUrl(work.link),
    })),
    quoteIds: raw.quotes.map((quote) => quote.id),
    keyIdeaIds: raw.keyIdeas.map((idea) => idea.id),
    arObjectIds: raw.arObjects.map((object) => object.id),
  })
}

export function normalizeCategory(
  raw: RawCategory | RawCategoryDetail,
) {
  const associatedPhilosophers =
    'associatedPhilosophers' in raw ? raw.associatedPhilosophers : []

  return categorySchema.parse({
    id: raw.id,
    abbreviation: raw.abbreviation,
    description: raw.description,
    imageReferences: normalizeFlatImages(raw.images),
    name: raw.name,
    wikiTitle: raw.wikiTitle,
    iepLink: nullableUrl(raw.iepLink),
    speLink: nullableUrl(raw.speLink),
    associatedPhilosopherIds: associatedPhilosophers.map(
      (philosopher) => philosopher.id,
    ),
  })
}

export function normalizeKeyIdea(raw: RawKeyIdea | RawKeyIdeaDetail) {
  const agreeingIdeas = 'agreeingKeyIdeas' in raw ? raw.agreeingKeyIdeas : []
  const disagreeingIdeas =
    'disagreeingKeyIdeas' in raw ? raw.disagreeingKeyIdeas : []

  return keyIdeaSchema.parse({
    id: raw.id,
    philosopherId: raw.philosopher.id,
    order: normalizedOrder(raw.order),
    categoryAbbreviations: raw.categoryAbbrevs,
    reference: nullableText(raw.reference),
    text: raw.text,
    agreeingKeyIdeaIds: agreeingIdeas.map((idea) => idea.id),
    disagreeingKeyIdeaIds: disagreeingIdeas.map((idea) => idea.id),
  })
}

export function normalizeQuote(raw: RawQuote | RawQuoteDetail) {
  const relatedQuotes = 'relatedQuotes' in raw ? raw.relatedQuotes : []

  return quoteSchema.parse({
    id: raw.id,
    philosopherId: raw.philosopher.id,
    text: raw.quote,
    work: nullableText(raw.work),
    year: parseHistoricalYear(raw.year),
    relatedQuoteIds: relatedQuotes.map((quote) => quote.id),
  })
}
