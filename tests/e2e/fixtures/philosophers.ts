interface FixturePhilosopher {
  id: string
  name: string
  username: string
  birthYear: string
  deathYear: string
  interests: string
  school: string
  life: string
  topicalDescription: string
  wikiTitle: string
  hasEBooks: boolean
  images: Record<string, Record<string, string>>
  libriVoxIDs: string[]
  libriVoxGetRequestLinks: string[]
}

const schools = [
  'Archive Stoicism',
  'Archive Empiricism',
  'Archive Rationalism',
  'Archive Humanism',
  'Archive Phenomenology',
  'Archive Analysis',
] as const

function historicalYear(index: number) {
  if (index < 18) return -650 + index * 58
  if (index < 30) return 500 + (index - 18) * 82
  if (index < 48) return 1_500 + (index - 30) * 16
  if (index < 78) return 1_800 + (index - 48) * 5
  return 1_945 + Math.round((index - 78) * 2.15)
}

function displayYear(year: number) {
  return year < 0 ? `${Math.abs(year)} BC` : `${year} AD`
}

function fixtureId(index: number) {
  return `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`
}

export const fixturePhilosophers: FixturePhilosopher[] = Array.from(
  { length: 114 },
  (_, index) => {
    const year = historicalYear(index)
    const deathYear = year < 1_940 ? year + 64 : year

    return {
      id: fixtureId(index),
      name: `Archive Thinker ${String(index + 1).padStart(3, '0')}`,
      username: `@ArchiveThinker${index + 1}`,
      birthYear: displayYear(year),
      deathYear: year < 1_940 ? displayYear(deathYear) : 'Present',
      interests: 'History of Philosophy, Ethics',
      school: schools[index % schools.length],
      life: `(${year}–${deathYear})`,
      topicalDescription:
        'A deterministic browser-test record used to verify the historical galaxy.',
      wikiTitle: `Archive Thinker ${index + 1}`,
      hasEBooks: false,
      images: {},
      libriVoxIDs: [],
      libriVoxGetRequestLinks: [],
    }
  },
)

export function fixturePhilosopherDetail(philosopher: FixturePhilosopher) {
  return {
    ...philosopher,
    birthLocation: {
      id: '10000000-0000-4000-8000-000000000001',
      philosopher: { id: philosopher.id },
      name: 'Deterministic Archive',
      latitude: 0,
      longitude: 0,
    },
    works: [],
    quotes: [],
    keyIdeas: [],
    arObjects: [],
  }
}
