export const SCENE_COLORS = {
  background: '#040610',
  backgroundDeep: '#02030a',
  structural: '#7b86c8',
  structuralBright: '#aeb8ff',
  semanticCore: '#f1f2ff',
  semanticHalo: '#aab4ff',
  selected: '#ffd59b',
  selectedHalo: '#ffb868',
  hovered: '#dce2ff',
  unknown: '#9298a8',
  dust: '#8f9bc7',
} as const

export const NODE_VISUAL_CONFIG = {
  coreRadius: 0.075,
  hoverScale: 1.45,
  selectedScale: 1.95,
  deEmphasizedScale: 0.9,
  haloOpacity: 0.2,
  selectedHaloOpacity: 0.42,
  hoverHaloOpacity: 0.32,
} as const

export const GUIDE_VISUAL_CONFIG = {
  spineThickness: 0.045,
  boundaryThickness: 0.022,
  regionOpacity: 0.035,
  clusterOpacity: 0.12,
} as const
