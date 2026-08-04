import type {
  RawCategory,
  RawKeyIdea,
  RawKeyIdeaDetail,
  RawPhilosopherSummary,
  RawPhilosopherDetail,
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

export const rawOwnedKeyIdeaFixture = {
  ...rawKeyIdeaFixture,
  id: '3B8B4D53-2886-45A4-877C-AE452A6A6F2A',
  internalID: '9',
  philosopher: { id: rawPhilosopherFixture.id },
  order: '9',
  text: 'Mind and matter are distinct kinds of substance.',
} satisfies RawKeyIdea

export const rawAgreeingKeyIdeaFixture = {
  ...rawKeyIdeaFixture,
  id: '3F2CF5D7-046E-4CCE-A296-3C9C15F2A6FA',
  internalID: '101',
  philosopher: { id: '4B7B8E3A-A01C-41B5-89B7-F6464C64A104' },
  text: 'Visible reality rests on a deeper intelligible order.',
} satisfies RawKeyIdea

export const rawDisagreeingKeyIdeaFixture = {
  ...rawKeyIdeaFixture,
  id: '4ED392A0-B357-44D2-91D5-4414E5A15A5E',
  internalID: '102',
  philosopher: { id: '93D94133-3DC0-42B9-A212-4348EC053CF3' },
  text: 'Mind and matter are expressions of one substance.',
} satisfies RawKeyIdea

export const rawOwnedKeyIdeaDetailFixture = {
  ...rawOwnedKeyIdeaFixture,
  agreeingKeyIdeas: [rawAgreeingKeyIdeaFixture],
  disagreeingKeyIdeas: [rawDisagreeingKeyIdeaFixture],
} satisfies RawKeyIdeaDetail

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

export const rawPhilosopherDetailFixture = {
  ...rawPhilosopherFixture,
  birthLocation: {
    id: '13692860-080E-420C-8946-135E961E8B3B',
    philosopher: { id: rawPhilosopherFixture.id },
    name: 'Kirkcaldy, Scotland',
    latitude: 56.11073,
    longitude: -3.16737,
  },
  works: [],
  quotes: [],
  keyIdeas: [rawOwnedKeyIdeaFixture],
  arObjects: [],
} satisfies RawPhilosopherDetail
