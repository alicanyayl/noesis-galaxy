import { deterministicSigned } from './deterministic-hash'

export const UNKNOWN_SCHOOL_KEY = 'unclassified'
export const UNKNOWN_SCHOOL_LABEL = 'Unclassified'

export interface SchoolCluster {
  key: string
  label: string
  y: number
  z: number
}

export function normalizeSchoolName(school: string | null) {
  const label = school?.trim().replace(/\s+/g, ' ')

  if (!label) {
    return { key: UNKNOWN_SCHOOL_KEY, label: UNKNOWN_SCHOOL_LABEL }
  }

  const key = label
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return {
    key: key || UNKNOWN_SCHOOL_KEY,
    label,
  }
}

export function getSchoolCluster(school: string | null): SchoolCluster {
  const normalized = normalizeSchoolName(school)

  return {
    ...normalized,
    y: deterministicSigned(normalized.key, 'school-y') * 4.2,
    z: deterministicSigned(normalized.key, 'school-z') * 1.45,
  }
}
