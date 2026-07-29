import { Component, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface ApplicationErrorBoundaryProps {
  children: ReactNode
}

interface ApplicationErrorBoundaryState {
  hasError: boolean
}

export class ApplicationErrorBoundary extends Component<
  ApplicationErrorBoundaryProps,
  ApplicationErrorBoundaryState
> {
  state: ApplicationErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ApplicationErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch() {
    // Intentionally quiet in the UI. Development tooling still captures the error.
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-svh place-items-center bg-background px-6 text-foreground">
          <section className="max-w-md text-center" aria-labelledby="error-title">
            <p className="mb-3 text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
              Noesis Galaxy
            </p>
            <h1 id="error-title" className="text-3xl font-medium tracking-tight">
              The universe paused unexpectedly.
            </h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              Reload the page to restart this foundation preview.
            </p>
            <Button
              className="mt-7 h-10 rounded-full px-5"
              onClick={() => window.location.reload()}
            >
              Reload preview
            </Button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
