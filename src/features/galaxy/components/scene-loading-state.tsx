import { LoaderCircle, Orbit } from 'lucide-react'

interface SceneLoadingStateProps {
  philosopherCount?: number
}

export function SceneLoadingState({
  philosopherCount,
}: SceneLoadingStateProps) {
  const status =
    philosopherCount === undefined
      ? 'Connecting to the archive'
      : `Positioning ${philosopherCount} thinkers across history`

  return (
    <div
      className="galaxy-loading pointer-events-none fixed inset-0 z-10 grid place-items-center px-5"
      role="status"
      aria-live="polite"
    >
      <div className="galaxy-loading__card">
        <span className="galaxy-loading__mark" aria-hidden="true">
          <Orbit />
        </span>
        <p className="galaxy-loading__eyebrow">Noesis Galaxy</p>
        <p className="galaxy-loading__status">{status}</p>
        <span className="galaxy-loading__progress" aria-hidden="true">
          <span />
        </span>
        <p className="galaxy-loading__note">
          Birth years set the horizontal path. School metadata forms the
          surrounding groups.
        </p>
        <LoaderCircle
          className="galaxy-loading__spinner"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
