import { Focus, LocateFixed, Tags, Waypoints } from 'lucide-react'

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
        {active ? 'Quiet view' : 'Enter galaxy'}
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
        Names {labelsVisible ? 'on' : 'off'}
      </Button>
      <Button
        className="h-9 rounded-full bg-background/55 backdrop-blur-md"
        variant="outline"
        aria-pressed={eraGuidesVisible}
        onClick={toggleEraGuides}
      >
        <Waypoints aria-hidden="true" />
        Eras {eraGuidesVisible ? 'on' : 'off'}
      </Button>
    </div>
  )
}
