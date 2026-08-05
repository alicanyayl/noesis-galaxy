export type SceneViewportClass = 'desktop' | 'tablet' | 'mobile'

export interface SceneQuality {
  viewportClass: SceneViewportClass
  distantStarCount: number
  midStarCount: number
  foregroundDustCount: number
  armDustCount: number
  supernovaCount: number
  visibleIdeaOrbitLimit: number
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
      distantStarCount: 1_100,
      midStarCount: 300,
      foregroundDustCount: 18,
      armDustCount: 440,
      supernovaCount: 0,
      visibleIdeaOrbitLimit: 4,
      nodeScaleMultiplier: 1.42,
      haloScaleMultiplier: 2.05,
      visibleSchoolLabelLimit: 1,
      overviewPadding: 1.04,
      selectionDistance: 8.1,
      ideaSelectionDistance: 9.1,
      selectedTargetOffsetY: -0.9,
    }
  }

  if (viewport.width < 1_200) {
    return {
      viewportClass: 'tablet',
      distantStarCount: 2_000,
      midStarCount: 560,
      foregroundDustCount: 32,
      armDustCount: 760,
      supernovaCount: 1,
      visibleIdeaOrbitLimit: 5,
      nodeScaleMultiplier: 1.24,
      haloScaleMultiplier: 2,
      visibleSchoolLabelLimit: 2,
      overviewPadding: 1.08,
      selectionDistance: 6.7,
      ideaSelectionDistance: 7.8,
      selectedTargetOffsetY: -0.25,
    }
  }

  return {
    viewportClass: 'desktop',
    distantStarCount: 3_200,
    midStarCount: 900,
    foregroundDustCount: 48,
    armDustCount: 1_100,
    supernovaCount: 2,
    visibleIdeaOrbitLimit: 5,
    nodeScaleMultiplier: 1.14,
    haloScaleMultiplier: 1.96,
    visibleSchoolLabelLimit: 2,
    overviewPadding: 1.08,
    selectionDistance: 6.25,
    ideaSelectionDistance: 7.25,
    selectedTargetOffsetY: 0,
  }
}
