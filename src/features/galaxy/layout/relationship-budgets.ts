export const RELATION_EDGE_BUDGETS = {
  overviewHints: 0,
  philosopherIdeaEdges: 5,
  initialPerKind: 3,
  expandedTotal: 12,
} as const

export const RELATION_EDGE_STYLES = {
  agreement: { continuous: true, directionalMarker: false },
  disagreement: { continuous: false, directionalMarker: false },
} as const

export function relationLimitForExpandedState(expanded: boolean) {
  return expanded
    ? RELATION_EDGE_BUDGETS.expandedTotal / 2
    : RELATION_EDGE_BUDGETS.initialPerKind
}
