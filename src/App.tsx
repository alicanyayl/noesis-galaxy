import { RouterProvider } from '@tanstack/react-router'

import { AppProviders } from '@/app/providers'
import { router, type AppRouter } from '@/app/router'

interface AppProps {
  appRouter?: AppRouter
}

function App({ appRouter = router }: AppProps) {
  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  )
}

export default App
