const HISTORICAL_CENTER_YEAR = 1_000
const HISTORICAL_COMPRESSION_YEARS = 450
const HISTORICAL_AXIS_SCALE = 5.6
const HISTORICAL_AXIS_LIMIT = 14

export const UNKNOWN_YEAR_X = 15.5

/**
 * Maps years onto a bounded, strictly increasing historical axis.
 *
 * The asinh transform retains BCE/CE ordering while compressing dense dates
 * far from the medieval center. The outer tanh bound prevents pathological
 * year values from creating unusably distant scene coordinates.
 */
export function mapHistoricalYearToX(year: number | null) {
  if (year === null || !Number.isFinite(year)) {
    return UNKNOWN_YEAR_X
  }

  const compressed =
    Math.asinh(
      (year - HISTORICAL_CENTER_YEAR) / HISTORICAL_COMPRESSION_YEARS,
    ) * HISTORICAL_AXIS_SCALE

  return (
    Math.tanh(compressed / HISTORICAL_AXIS_LIMIT) * HISTORICAL_AXIS_LIMIT
  )
}
