import { LocateFixed, Sparkles, Tags, Unplug } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useExperienceStore } from '@/stores/experience-store'

interface SceneControlsProps {
  hasSelection: boolean
  onReset: () => void
}

export function SceneControls({
  hasSelection,
  onReset,
}: SceneControlsProps) {
  const labelsVisible = useExperienceStore((state) => state.labelsVisible)
  const toggleLabels = useExperienceStore((state) => state.toggleLabels)
  const connectionsVisible = useExperienceStore(
    (state) => state.connectionsVisible,
  )
  const toggleConnections = useExperienceStore(
    (state) => state.toggleConnections,
  )
  const backgroundMotionEnabled = useExperienceStore(
    (state) => state.backgroundMotionEnabled,
  )
  const toggleBackgroundMotion = useExperienceStore(
    (state) => state.toggleBackgroundMotion,
  )

  return (
    <div
      className="galaxy-control-row flex flex-wrap gap-2"
      aria-label="Historical galaxy controls"
    >
      <Button
        className="h-9 rounded-full bg-background/55 backdrop-blur-md"
        variant="outline"
        onClick={onReset}
      >
        <LocateFixed aria-hidden="true" />
        Reset
      </Button>
      {!hasSelection ? (
        <Button
          className="h-9 rounded-full bg-background/45 backdrop-blur-md"
          variant="outline"
          aria-pressed={labelsVisible}
          onClick={toggleLabels}
        >
          <Tags aria-hidden="true" />
          Schools
        </Button>
      ) : (
        <Button
          className="h-9 rounded-full bg-background/45 backdrop-blur-md"
          variant="outline"
          aria-pressed={connectionsVisible}
          onClick={toggleConnections}
        >
          <Unplug aria-hidden="true" />
          Links
        </Button>
      )}
      <Button
        className="h-9 rounded-full bg-background/45 backdrop-blur-md"
        variant="outline"
        aria-pressed={backgroundMotionEnabled}
        onClick={toggleBackgroundMotion}
      >
        <Sparkles aria-hidden="true" />
        Motion
      </Button>
    </div>
  )
}
