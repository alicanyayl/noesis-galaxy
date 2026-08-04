import { z } from 'zod'

import { entityIdSchema, rawEntityReferenceSchema } from './common.ts'

export const rawKeyIdeaSchema = z.object({
  id: entityIdSchema,
  internalID: z.string().min(1),
  philosopher: rawEntityReferenceSchema,
  order: z.string().min(1),
  categoryAbbrevs: z.array(z.string().min(1)),
  reference: z.string(),
  text: z.string().min(1),
})

export const rawKeyIdeaCollectionSchema = z.array(rawKeyIdeaSchema)

export const rawKeyIdeaDetailSchema = rawKeyIdeaSchema.extend({
  agreeingKeyIdeas: z.array(rawKeyIdeaSchema),
  disagreeingKeyIdeas: z.array(rawKeyIdeaSchema),
})

export const keyIdeaSchema = z.object({
  id: entityIdSchema,
  philosopherId: entityIdSchema,
  order: z.number().int().nonnegative().nullable(),
  categoryAbbreviations: z.array(z.string().min(1)),
  reference: z.string().nullable(),
  text: z.string().min(1),
  agreeingKeyIdeaIds: z.array(entityIdSchema),
  disagreeingKeyIdeaIds: z.array(entityIdSchema),
})

export type RawKeyIdea = z.infer<typeof rawKeyIdeaSchema>
export type RawKeyIdeaDetail = z.infer<typeof rawKeyIdeaDetailSchema>
export type KeyIdea = z.infer<typeof keyIdeaSchema>
