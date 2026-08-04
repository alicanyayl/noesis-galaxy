import { RouterProvider } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import { AppProviders } from '@/app/providers'
import { router, type AppRouter } from '@/app/router'

interface AppProps {
  appRouter?: AppRouter
  queryClient?: QueryClient
}

function App({ appRouter = router, queryClient }: AppProps) {
  return (
    <AppProviders client={queryClient}>
      <RouterProvider router={appRouter} />
    </AppProviders>
  )
}

export default App
