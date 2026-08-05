export const SCENE_COLORS = {
  background: '#01030a',
  backgroundDeep: '#000107',
  distantStar: '#9eb7d8',
  midStar: '#d8e8ff',
  foregroundDust: '#7895b8',
  structural: '#6477a8',
  structuralBright: '#94a9d6',
  semanticCore: '#edf6ff',
  semanticHalo: '#78aee0',
  bodyEmissive: '#071326',
  planetIce: '#b9d4e6',
  planetWarm: '#d8bca2',
  selected: '#f6d3a0',
  selectedHalo: '#d58d4d',
  hovered: '#e5f1ff',
  unknown: '#9298a8',
  dust: '#6f83a7',
  coreGlow: '#8caedf',
  streamCyan: '#6fa5c4',
  streamViolet: '#897fae',
  streamGlow: '#667eaa',
  streamBright: '#b5cae3',
  idea: '#b9e9f3',
  ideaThread: '#7fb4c8',
  agreement: '#71c6b8',
  disagreement: '#d58b68',
  disagreementMarker: '#d98b82',
  supernovaCore: '#fff4d8',
  supernovaEdge: '#e5a96f',
  supernovaDust: '#c78b65',
  variantIvory: '#f4ecd8',
  variantCool: '#d9e4f4',
} as const

export const NODE_VISUAL_CONFIG = {
  coreRadius: 0.1,
  hoverScale: 1.28,
  selectedScale: 1.45,
  deEmphasizedScale: 0.16,
  haloOpacity: 0.055,
  selectedHaloOpacity: 0.16,
  hoverHaloOpacity: 0.2,
  ringOpacity: 0.22,
  coronaOpacity: 0.08,
  binaryScale: 0.48,
} as const

export const GUIDE_VISUAL_CONFIG = {
  spineThickness: 0.045,
  boundaryThickness: 0.022,
  regionOpacity: 0.035,
  clusterOpacity: 0.12,
} as const

export const GALAXY_VISUAL_CONFIG = {
  streamGlowWidth: 0,
  streamCoreWidth: 0,
  echoWidth: 0,
  innerLoopWidth: 0,
  schoolArcWidth: 0.55,
} as const

export const BACKGROUND_VISUAL_CONFIG = {
  distantSize: 0.12,
  distantOpacity: 0.58,
  midSize: 0.22,
  midOpacity: 0.72,
  dustSize: 0.48,
  dustOpacity: 0.7,
  motionSpeed: 0.0012,
} as const

export const SUPERNOVA_VISUAL_CONFIG = {
  coreRadius: 0.11,
  shellScale: 3.7,
  ringRadius: 0.48,
  ringThickness: 0.012,
  coreOpacity: 0.9,
  shellOpacity: 0.12,
  ringOpacity: 0.28,
  radialParticleCount: 22,
  pulseSpeed: 0.22,
} as const

export const RELATION_VISUAL_CONFIG = {
  ownerWidth: 1.15,
  ownerOpacity: 0.34,
  selectedOwnerWidth: 2.2,
  agreementWidth: 2.35,
  agreementOpacity: 0.9,
  disagreementWidth: 2.15,
  disagreementOpacity: 0.92,
  disagreementDash: 0.13,
  disagreementGap: 0.095,
} as const
