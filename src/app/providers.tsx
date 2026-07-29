import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { ApplicationErrorBoundary } from '@/components/layout/application-error-boundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60_000,
    },
  },
})

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ApplicationErrorBoundary>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApplicationErrorBoundary>
  )
}
