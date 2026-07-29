import { Link } from '@tanstack/react-router'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NotFoundPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-6 text-foreground">
      <section className="max-w-lg text-center" aria-labelledby="not-found-title">
        <p className="text-xs font-medium tracking-[0.24em] text-accent uppercase">
          404 · Unmapped space
        </p>
        <h1
          id="not-found-title"
          className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl"
        >
          This path has no coordinates.
        </h1>
        <p className="mt-5 leading-7 text-muted-foreground">
          The foundation currently contains only the opening Noesis Galaxy
          experience.
        </p>
        <Link
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'mt-7 rounded-full px-5',
          )}
          to="/"
        >
          Return to the foundation
        </Link>
      </section>
    </main>
  )
}
