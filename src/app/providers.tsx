import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { createAppQueryClient } from '@/app/query-client'
import { ApplicationErrorBoundary } from '@/components/layout/application-error-boundary'

const queryClient = createAppQueryClient()

interface AppProvidersProps {
  children: ReactNode
  client?: QueryClient
}

export function AppProviders({
  children,
  client = queryClient,
}: AppProvidersProps) {
  return (
    <ApplicationErrorBoundary>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ApplicationErrorBoundary>
  )
}
