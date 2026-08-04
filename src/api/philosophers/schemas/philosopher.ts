import { z } from 'zod'

import {
  coordinatesSchema,
  entityIdSchema,
  historicalYearSchema,
  imageReferencesSchema,
  rawEntityReferenceSchema,
  rawGroupedImagesSchema,
  rawLocationSchema,
} from './common.ts'
import { rawKeyIdeaSchema } from './key-idea.ts'
import { rawQuoteSchema } from './quote.ts'

const rawWorkSchema = z.object({
  id: entityIdSchema,
  philosopher: rawEntityReferenceSchema,
  title: z.string().min(1),
  link: z.string().optional(),
})

export const rawPhilosopherSummarySchema = z.object({
  id: entityIdSchema,
  name: z.string().min(1),
  username: z.string().min(1),
  birthYear: z.string().min(1),
  deathYear: z.string().optional(),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  interests: z.string(),
  school: z.string().optional(),
  life: z.string().min(1),
  topicalDescription: z.string().optional(),
  speLink: z.url().optional(),
  iepLink: z.url().optional(),
  wikiTitle: z.string().min(1),
  hasEBooks: z.boolean(),
  images: rawGroupedImagesSchema,
  libriVoxIDs: z.array(z.string()),
  libriVoxGetRequestLinks: z.array(z.url()),
})

export const rawPhilosopherCollectionSchema = z
  .array(z.unknown())
  .transform((items, context) => {
    const philosophers = items.flatMap((item) => {
      const result = rawPhilosopherSummarySchema.safeParse(item)
      return result.success ? [result.data] : []
    })

    if (items.length > 0 && philosophers.length === 0) {
      context.addIssue({
        code: 'custom',
        message: 'No philosopher records matched the validated schema.',
      })
    }

    return philosophers
  })

export const rawPhilosopherDetailSchema = rawPhilosopherSummarySchema.extend({
  birthLocation: rawLocationSchema.nullish(),
  works: z.array(rawWorkSchema),
  quotes: z.array(rawQuoteSchema),
  keyIdeas: z.array(rawKeyIdeaSchema),
  arObjects: z.array(rawEntityReferenceSchema),
})

const workSchema = z.object({
  id: entityIdSchema,
  title: z.string().min(1),
  link: z.url().nullable(),
})

export const philosopherSummarySchema = z.object({
  id: entityIdSchema,
  name: z.string().min(1),
  username: z.string().min(1),
  birthYear: historicalYearSchema,
  deathYear: historicalYearSchema,
  interests: z.array(z.string().min(1)),
  school: z.string().nullable(),
  life: z.string().min(1),
  topicalDescription: z.string().nullable(),
  speLink: z.url().nullable(),
  iepLink: z.url().nullable(),
  wikiTitle: z.string().min(1),
  hasEBooks: z.boolean(),
  imageReferences: imageReferencesSchema,
  libriVoxIDs: z.array(z.string()),
  libriVoxGetRequestLinks: z.array(z.url()),
})

export const philosopherDetailSchema = philosopherSummarySchema.extend({
  birthDate: z.string().nullable(),
  deathDate: z.string().nullable(),
  birthLocationName: z.string().nullable(),
  coordinates: coordinatesSchema.nullable(),
  works: z.array(workSchema),
  quoteIds: z.array(entityIdSchema),
  keyIdeaIds: z.array(entityIdSchema),
  arObjectIds: z.array(entityIdSchema),
})

export type RawPhilosopherSummary = z.infer<
  typeof rawPhilosopherSummarySchema
>
export type RawPhilosopherDetail = z.infer<typeof rawPhilosopherDetailSchema>
export type PhilosopherSummary = z.infer<typeof philosopherSummarySchema>
export type PhilosopherDetail = z.infer<typeof philosopherDetailSchema>
