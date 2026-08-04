import type {
  RawCategory,
  RawKeyIdea,
  RawPhilosopherSummary,
  RawQuote,
} from '@/api/philosophers'

export const rawPhilosopherFixture = {
  id: 'FB944B6B-3638-496F-A6CC-66C4250ED9AD',
  name: 'Adam Smith',
  username: '@InvisibleHand',
  birthYear: '1723 AD',
  deathYear: '1790 AD',
  birthDate: '16 June 1723',
  deathDate: '17 July 1790',
  interests: 'Political Philosophy, Ethics, Economics',
  school: 'Classical Economics',
  life: '(1723-1790)',
  topicalDescription:
    'Adam Smith’s theory of economics remains relevant to contemporary policy.',
  speLink: 'https://plato.stanford.edu/entries/smith-moral-political/',
  iepLink: 'https://www.iep.utm.edu/smith/',
  wikiTitle: 'Adam Smith',
  hasEBooks: true,
  images: {
    faceImages: {
      face250x250: '/Images/Adam-SmithFace.jpg',
    },
    illustrations: {
      ill250x250: '/Images/Adam-Smith-Ill.png',
    },
  },
  libriVoxIDs: ['2013'],
  libriVoxGetRequestLinks: [
    'https://librivox.org/api/feed/audiobooks/?id=2013&extended=1&format=json',
  ],
} satisfies RawPhilosopherSummary

export const rawKeyIdeaFixture = {
  id: '30450D03-4200-4A85-BE54-925F4E9E0AC5',
  internalID: '0',
  philosopher: { id: '5B8D36E5-56E2-47E4-9C4C-34A0F107D9B1' },
  order: '1',
  categoryAbbrevs: ['on'],
  reference: 'The Story of Philosophy, Bryan Magee, DK Pub., 1998',
  text: 'Everything is composed of water just in different forms.',
} satisfies RawKeyIdea

export const rawCategoryFixture = {
  id: '7CF726D6-547D-4204-8656-D9F12A5F2B76',
  abbreviation: 'ae',
  description:
    'Aesthetics is the branch of philosophy that explores the nature of art, beauty, and taste.',
  images: {
    banner400x300: '/Images/Aesthetics.png',
  },
  name: 'Aesthetics',
  wikiTitle: 'Aesthetics',
  iepLink: 'https://www.iep.utm.edu/aestheti/',
} satisfies RawCategory

export const rawQuoteFixture = {
  id: '29B2668B-4DBD-42A7-A0E5-232FB55AF008',
  internalID: '1',
  philosopher: { id: 'F8320389-19D4-4095-95A3-A93A7F7F7997' },
  quote:
    'Into that from which things take their rise they pass away once more.',
  work: '',
  year: '',
} satisfies RawQuote
