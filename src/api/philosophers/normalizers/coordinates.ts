import { z } from 'zod'

import {
  coordinatesSchema,
  type Coordinates,
} from '../schemas/common.ts'

function numericCoordinate(value: unknown) {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? Number.NaN : Number(trimmed)
}

const coordinateInputSchema = z.object({
  latitude: z.preprocess(
    numericCoordinate,
    z.number().finite().min(-90).max(90),
  ),
  longitude: z.preprocess(
    numericCoordinate,
    z.number().finite().min(-180).max(180),
  ),
})

export function normalizeCoordinates(value: unknown): Coordinates | null {
  const result = coordinateInputSchema.safeParse(value)
  return result.success ? coordinatesSchema.parse(result.data) : null
}
