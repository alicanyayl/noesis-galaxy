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

export interface FixtureKeyIdea {
  id: string
  internalID: string
  philosopher: { id: string }
  order: string
  categoryAbbrevs: string[]
  reference: string
  text: string
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

function archivePhilosopher(index: number): FixturePhilosopher {
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
}

export const fixtureIds = {
  descartes: '3C6BCB23-5C68-4F54-B680-BFF333FB6683',
  plato: '4B7B8E3A-A01C-41B5-89B7-F6464C64A104',
  spinoza: '93D94133-3DC0-42B9-A212-4348EC053CF3',
  hobbes: 'EADA6FFC-5014-484E-988E-6A06F5AD949A',
} as const

const verifiedPhilosophers: FixturePhilosopher[] = [
  {
    ...archivePhilosopher(0),
    id: fixtureIds.descartes,
    name: 'René Descartes',
    username: '@ReneDescartes',
    birthYear: '1596 AD',
    deathYear: '1650 AD',
    interests: 'Metaphysics, Epistemology, Mathematics',
    school: 'Cartesianism',
    life: '(1596–1650)',
    topicalDescription: 'A sanitized fixture modeled on the verified API record.',
    wikiTitle: 'René Descartes',
    images: {
      thumbnailIllustrations: {
        thumbnailIll150x150: '/Images/Rene-Descartes-Ill-small@3x.png',
      },
      faceImages: {
        face250x250: '/Images/Rene-DescartesFace.jpg',
      },
    },
  },
  {
    ...archivePhilosopher(1),
    id: fixtureIds.plato,
    name: 'Plato',
    username: '@Plato',
    birthYear: '427 BC',
    deathYear: '347 BC',
    school: 'Platonism',
    wikiTitle: 'Plato',
  },
  {
    ...archivePhilosopher(2),
    id: fixtureIds.spinoza,
    name: 'Baruch Spinoza',
    username: '@Spinoza',
    birthYear: '1632 AD',
    deathYear: '1677 AD',
    school: 'Rationalism',
    wikiTitle: 'Baruch Spinoza',
  },
  {
    ...archivePhilosopher(3),
    id: fixtureIds.hobbes,
    name: 'Thomas Hobbes',
    username: '@Hobbes',
    birthYear: '1588 AD',
    deathYear: '1679 AD',
    school: 'Materialism',
    wikiTitle: 'Thomas Hobbes',
  },
]

export const fixturePhilosophers: FixturePhilosopher[] = Array.from(
  { length: 114 },
  (_, index) => verifiedPhilosophers[index] ?? archivePhilosopher(index),
)

const idea = (
  id: string,
  internalID: string,
  philosopherId: string,
  text: string,
  order = internalID,
): FixtureKeyIdea => ({
  id,
  internalID,
  philosopher: { id: philosopherId },
  order,
  categoryAbbrevs: ['on'],
  reference: 'Sanitized from a verified Philosophers API relationship shape.',
  text,
})

export const dualismIdeaId = '3B8B4D53-2886-45A4-877C-AE452A6A6F2A'

export const fixtureKeyIdeas: FixtureKeyIdea[] = [
  idea('42F13F0F-F093-4881-86CC-8F0817C1FC48', '1', fixtureIds.descartes, 'Mathematics begins from secure premises and proceeds by deduction.'),
  idea('D2DD3B07-DB06-4A2F-B9F1-6532B5C15B86', '2', fixtureIds.descartes, 'Sound knowledge should begin with premises that cannot be doubted.'),
  idea('64F4479B-5886-4462-A122-316888BE1885', '3', fixtureIds.descartes, 'The senses can deceive us and observations may be doubted.'),
  idea('4DE08204-8489-4036-9BC6-D5C8267496A5', '4', fixtureIds.descartes, 'Experience could be manipulated by a deceiving power.'),
  idea('3871E70D-0FD2-40B6-8EE1-0A86790140F0', '5', fixtureIds.descartes, 'One can be certain that an experience is occurring.'),
  idea('C8858033-2B2C-4AC8-9D35-62EEFCE57094', '6', fixtureIds.descartes, 'One’s existence is certain even when the world is doubted.'),
  idea(dualismIdeaId, '9', fixtureIds.descartes, 'The universe contains two kinds of substance: mind and matter.', '9'),
]

export const agreeingIdea = idea(
  '3F2CF5D7-046E-4CCE-A296-3C9C15F2A6FA',
  '101',
  fixtureIds.plato,
  'Visible reality rests on a deeper intelligible order.',
)

export const disagreeingIdeas = [
  idea(
    '4ED392A0-B357-44D2-91D5-4414E5A15A5E',
    '102',
    fixtureIds.spinoza,
    'Mind and matter are two expressions of one substance.',
  ),
  idea(
    'D7480074-A845-41C6-9BA9-2843A7C9652B',
    '103',
    fixtureIds.hobbes,
    'Matter in motion comprises the universe.',
  ),
]

export const fixtureAllKeyIdeas = [
  ...fixtureKeyIdeas,
  agreeingIdea,
  ...disagreeingIdeas,
]

export function fixtureKeyIdeaDetail(keyIdea: FixtureKeyIdea) {
  return {
    ...keyIdea,
    agreeingKeyIdeas: keyIdea.id === dualismIdeaId ? [agreeingIdea] : [],
    disagreeingKeyIdeas:
      keyIdea.id === dualismIdeaId ? disagreeingIdeas : [],
  }
}

export function fixturePhilosopherDetail(philosopher: FixturePhilosopher) {
  return {
    ...philosopher,
    birthLocation: {
      id: '10000000-0000-4000-8000-000000000001',
      philosopher: { id: philosopher.id },
      name:
        philosopher.id === fixtureIds.descartes
          ? 'La Haye en Touraine, France'
          : 'Deterministic Archive',
      latitude: 0,
      longitude: 0,
    },
    works: [],
    quotes: [],
    keyIdeas:
      philosopher.id === fixtureIds.descartes ? fixtureKeyIdeas : [],
    arObjects: [],
  }
}
