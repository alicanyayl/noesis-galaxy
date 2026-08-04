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
  coreGlow: '#b8c8ff',
  streamCyan: '#78d9df',
  streamViolet: '#9a8cff',
  streamGlow: '#7876d9',
  streamBright: '#c2c8ff',
  idea: '#c9edff',
  ideaThread: '#a7d9ef',
  agreement: '#8fe4dc',
  disagreement: '#f1a66f',
} as const

export const NODE_VISUAL_CONFIG = {
  coreRadius: 0.075,
  hoverScale: 1.45,
  selectedScale: 1.95,
  deEmphasizedScale: 0.44,
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

export const GALAXY_VISUAL_CONFIG = {
  streamGlowWidth: 9,
  streamCoreWidth: 1.05,
} as const
