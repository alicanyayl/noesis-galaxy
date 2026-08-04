import { create } from 'zustand'

export type ExperienceMode = 'intro' | 'explore'

interface ExperienceState {
  mode: ExperienceMode
  hoveredPhilosopherId: string | null
  labelsVisible: boolean
  eraGuidesVisible: boolean
  cameraResetRequest: number
  setMode: (mode: ExperienceMode) => void
  setHoveredPhilosopherId: (id: string | null) => void
  toggleLabels: () => void
  toggleEraGuides: () => void
  requestCameraReset: () => void
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  mode: 'intro',
  hoveredPhilosopherId: null,
  labelsVisible: true,
  eraGuidesVisible: true,
  cameraResetRequest: 0,
  setMode: (mode) => set({ mode }),
  setHoveredPhilosopherId: (id) =>
    set((state) =>
      state.hoveredPhilosopherId === id
        ? state
        : { hoveredPhilosopherId: id },
    ),
  toggleLabels: () => set((state) => ({ labelsVisible: !state.labelsVisible })),
  toggleEraGuides: () =>
    set((state) => ({ eraGuidesVisible: !state.eraGuidesVisible })),
  requestCameraReset: () =>
    set((state) => ({ cameraResetRequest: state.cameraResetRequest + 1 })),
}))
