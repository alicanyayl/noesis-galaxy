import { create } from 'zustand'

export type ExperienceMode = 'intro' | 'explore'

interface ExperienceState {
  mode: ExperienceMode
  setMode: (mode: ExperienceMode) => void
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  mode: 'intro',
  setMode: (mode) => set({ mode }),
}))
