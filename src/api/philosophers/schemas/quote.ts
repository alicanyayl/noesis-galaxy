import { z } from 'zod'

import {
  entityIdSchema,
  historicalYearSchema,
  rawEntityReferenceSchema,
} from './common.ts'

export const rawQuoteSchema = z.object({
  id: entityIdSchema,
  internalID: z.string().min(1),
  philosopher: rawEntityReferenceSchema,
  quote: z.string().min(1),
  work: z.string(),
  year: z.string().nullable(),
})

export const rawQuoteCollectionSchema = z.array(rawQuoteSchema)

export const rawQuoteDetailSchema = rawQuoteSchema.extend({
  relatedQuotes: z.array(rawQuoteSchema),
})

export const quoteSchema = z.object({
  id: entityIdSchema,
  philosopherId: entityIdSchema,
  text: z.string().min(1),
  work: z.string().nullable(),
  year: historicalYearSchema,
  relatedQuoteIds: z.array(entityIdSchema),
})

export type RawQuote = z.infer<typeof rawQuoteSchema>
export type RawQuoteDetail = z.infer<typeof rawQuoteDetailSchema>
export type Quote = z.infer<typeof quoteSchema>
