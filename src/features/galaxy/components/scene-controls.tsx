import { Focus, LocateFixed, Tags, Unplug, Waypoints } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useExperienceStore } from '@/stores/experience-store'

interface SceneControlsProps {
  active: boolean
  hasSelection: boolean
  onReset: () => void
  onToggleActive: () => void
}

export function SceneControls({
  active,
  hasSelection,
  onReset,
  onToggleActive,
}: SceneControlsProps) {
  const labelsVisible = useExperienceStore((state) => state.labelsVisible)
  const eraGuidesVisible = useExperienceStore(
    (state) => state.eraGuidesVisible,
  )
  const toggleLabels = useExperienceStore((state) => state.toggleLabels)
  const toggleEraGuides = useExperienceStore(
    (state) => state.toggleEraGuides,
  )
  const connectionsVisible = useExperienceStore(
    (state) => state.connectionsVisible,
  )
  const toggleConnections = useExperienceStore(
    (state) => state.toggleConnections,
  )

  return (
    <div
      className="flex flex-wrap gap-2"
      aria-label="Historical galaxy controls"
    >
      <Button
        className="h-9 rounded-full border-accent/25 bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={onToggleActive}
      >
        <Focus aria-hidden="true" />
        {active ? 'Quiet view' : 'Explore freely'}
      </Button>
      <Button
        className="h-9 rounded-full bg-background/55 backdrop-blur-md"
        variant="outline"
        onClick={onReset}
        disabled={!active && !hasSelection}
      >
        <LocateFixed aria-hidden="true" />
        Reset view
      </Button>
      <Button
        className="h-9 rounded-full bg-background/55 backdrop-blur-md"
        variant="outline"
        aria-pressed={labelsVisible}
        onClick={toggleLabels}
      >
        <Tags aria-hidden="true" />
        Schools {labelsVisible ? 'on' : 'off'}
      </Button>
      <Button
        className="h-9 rounded-full bg-background/55 backdrop-blur-md"
        variant="outline"
        aria-pressed={connectionsVisible}
        onClick={toggleConnections}
      >
        <Unplug aria-hidden="true" />
        Connections {connectionsVisible ? 'on' : 'off'}
      </Button>
      <Button
        className="h-9 rounded-full bg-background/55 backdrop-blur-md"
        variant="outline"
        aria-pressed={eraGuidesVisible}
        onClick={toggleEraGuides}
      >
        <Waypoints aria-hidden="true" />
        Galaxy path {eraGuidesVisible ? 'on' : 'off'}
      </Button>
    </div>
  )
}
