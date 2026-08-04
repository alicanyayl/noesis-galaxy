import { z } from 'zod'

export const entityIdSchema = z.uuid()

export const rawEntityReferenceSchema = z.object({
  id: entityIdSchema,
})

export const rawAssetPathSchema = z.string().trim().min(1)

export const rawGroupedImagesSchema = z.record(
  z.string().min(1),
  z.record(z.string().min(1), rawAssetPathSchema),
)

export const rawFlatImagesSchema = z.record(
  z.string().min(1),
  rawAssetPathSchema,
)

export const imageReferencesSchema = z.record(
  z.string().min(1),
  z.url().nullable(),
)

export const historicalYearSchema = z.object({
  original: z.string().nullable(),
  numeric: z.number().int().nullable(),
  era: z.enum(['BCE', 'CE', 'present', 'unknown']),
})

export const coordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
})

const rawCoordinateValueSchema = z.union([
  z.number().finite(),
  z.string().trim().regex(/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/),
])

export const rawLocationSchema = z.object({
  id: entityIdSchema,
  philosopher: rawEntityReferenceSchema,
  name: z.string().min(1),
  latitude: rawCoordinateValueSchema,
  longitude: rawCoordinateValueSchema,
})

export type HistoricalYear = z.infer<typeof historicalYearSchema>
export type Coordinates = z.infer<typeof coordinatesSchema>
export type RawLocation = z.infer<typeof rawLocationSchema>
