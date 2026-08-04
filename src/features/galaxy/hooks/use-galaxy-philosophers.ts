import { useMemo } from 'react'

import type { PhilosopherSummary } from '@/api/philosophers'
import { createGalaxyPhilosopherNodes } from '@/features/galaxy/layout/philosopher-position'

export function useGalaxyPhilosophers(philosophers: PhilosopherSummary[]) {
  return useMemo(
    () => createGalaxyPhilosopherNodes(philosophers),
    [philosophers],
  )
}
