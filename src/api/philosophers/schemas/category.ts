import { z } from 'zod'

import {
  entityIdSchema,
  imageReferencesSchema,
  rawEntityReferenceSchema,
  rawFlatImagesSchema,
} from './common.ts'

export const rawCategorySchema = z.object({
  id: entityIdSchema,
  abbreviation: z.string().min(1),
  description: z.string().min(1),
  images: rawFlatImagesSchema,
  name: z.string().min(1),
  wikiTitle: z.string().min(1),
  iepLink: z.url().optional(),
  speLink: z.url().optional(),
})

export const rawCategoryCollectionSchema = z.array(rawCategorySchema)

export const rawCategoryDetailSchema = rawCategorySchema.extend({
  associatedPhilosophers: z.array(rawEntityReferenceSchema),
})

export const categorySchema = z.object({
  id: entityIdSchema,
  abbreviation: z.string().min(1),
  description: z.string().min(1),
  imageReferences: imageReferencesSchema,
  name: z.string().min(1),
  wikiTitle: z.string().min(1),
  iepLink: z.url().nullable(),
  speLink: z.url().nullable(),
  associatedPhilosopherIds: z.array(entityIdSchema),
})

export type RawCategory = z.infer<typeof rawCategorySchema>
export type RawCategoryDetail = z.infer<typeof rawCategoryDetailSchema>
export type Category = z.infer<typeof categorySchema>
