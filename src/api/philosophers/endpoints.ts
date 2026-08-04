export const PHILOSOPHERS_API_ORIGIN = 'https://philosophersapi.com'
export const PHILOSOPHERS_API_BASE_URL = `${PHILOSOPHERS_API_ORIGIN}/api`

function entityPath(resource: string, id: string) {
  return `/${resource}/${encodeURIComponent(id)}`
}

export const philosophersApiEndpoints = {
  philosophers: '/philosophers',
  philosopher: (id: string) => entityPath('philosophers', id),
  categories: '/categories',
  category: (id: string) => entityPath('categories', id),
  keyIdeas: '/keyideas',
  keyIdea: (id: string) => entityPath('keyideas', id),
  quotes: '/quotes',
  quote: (id: string) => entityPath('quotes', id),
} as const
