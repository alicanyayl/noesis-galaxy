export type SceneViewportClass = 'desktop' | 'tablet' | 'mobile'

export interface SceneQuality {
  viewportClass: SceneViewportClass
  decorativeStarCount: number
  nodeScaleMultiplier: number
  haloScaleMultiplier: number
  visibleSchoolLabelLimit: number
  overviewPadding: number
  selectionDistance: number
  selectedTargetOffsetY: number
}

export interface SceneViewport {
  width: number
  height: number
}

export function getSceneQuality(viewport: SceneViewport): SceneQuality {
  if (viewport.width < 640) {
    return {
      viewportClass: 'mobile',
      decorativeStarCount: 150,
      nodeScaleMultiplier: 1.8,
      haloScaleMultiplier: 1.9,
      visibleSchoolLabelLimit: 1,
      overviewPadding: 1.04,
      selectionDistance: 6.8,
      selectedTargetOffsetY: -1.4,
    }
  }

  if (viewport.width < 1_200) {
    return {
      viewportClass: 'tablet',
      decorativeStarCount: 260,
      nodeScaleMultiplier: 1.5,
      haloScaleMultiplier: 1.78,
      visibleSchoolLabelLimit: 3,
      overviewPadding: 1.08,
      selectionDistance: 5.9,
      selectedTargetOffsetY: -0.45,
    }
  }

  return {
    viewportClass: 'desktop',
    decorativeStarCount: 380,
    nodeScaleMultiplier: 1.32,
    haloScaleMultiplier: 1.72,
    visibleSchoolLabelLimit: 4,
    overviewPadding: 1.12,
    selectionDistance: 5.2,
    selectedTargetOffsetY: 0,
  }
}
