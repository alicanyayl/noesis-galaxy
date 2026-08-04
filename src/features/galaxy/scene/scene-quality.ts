export type SceneViewportClass = 'desktop' | 'tablet' | 'mobile'

export interface SceneQuality {
  viewportClass: SceneViewportClass
  decorativeStarCount: number
  armDustCount: number
  nodeScaleMultiplier: number
  haloScaleMultiplier: number
  visibleSchoolLabelLimit: number
  overviewPadding: number
  selectionDistance: number
  ideaSelectionDistance: number
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
      armDustCount: 440,
      nodeScaleMultiplier: 1.8,
      haloScaleMultiplier: 1.9,
      visibleSchoolLabelLimit: 1,
      overviewPadding: 1.04,
      selectionDistance: 6.8,
      ideaSelectionDistance: 8.2,
      selectedTargetOffsetY: -1.4,
    }
  }

  if (viewport.width < 1_200) {
    return {
      viewportClass: 'tablet',
      decorativeStarCount: 260,
      armDustCount: 760,
      nodeScaleMultiplier: 1.5,
      haloScaleMultiplier: 1.78,
      visibleSchoolLabelLimit: 3,
      overviewPadding: 1.08,
      selectionDistance: 5.9,
      ideaSelectionDistance: 7.3,
      selectedTargetOffsetY: -0.45,
    }
  }

  return {
    viewportClass: 'desktop',
    decorativeStarCount: 380,
    armDustCount: 1_100,
    nodeScaleMultiplier: 1.32,
    haloScaleMultiplier: 1.72,
    visibleSchoolLabelLimit: 4,
    overviewPadding: 1.12,
    selectionDistance: 5.2,
    ideaSelectionDistance: 6.7,
    selectedTargetOffsetY: 0,
  }
}
