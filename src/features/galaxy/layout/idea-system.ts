import type { KeyIdea } from '@/api/philosophers'
import type {
  GalaxyIdeaNode,
  GalaxyPosition,
} from '@/features/galaxy/types/galaxy'

export const MAX_VISIBLE_IDEAS = 6
export const MAX_VISIBLE_RELATIONS_PER_KIND = 4

export function createIdeaNodes(
  ideas: readonly KeyIdea[],
  center: GalaxyPosition,
): GalaxyIdeaNode[] {
  const count = Math.max(ideas.length, 1)

  return ideas.map((idea, index) => {
    const angle = -Math.PI / 2 + (index / count) * Math.PI * 2
    const alternatingRadius = 1.4 + (index % 2) * 0.34

    return {
      idea,
      position: {
        x: center.x + Math.cos(angle) * alternatingRadius,
        y: center.y + Math.sin(angle) * alternatingRadius * 0.68,
        z: center.z + 0.24 + Math.sin(angle * 2) * 0.18,
      },
      relation: 'owner',
    }
  })
}

export function createRelatedIdeaNodes(
  agreeingIdeas: readonly KeyIdea[],
  disagreeingIdeas: readonly KeyIdea[],
  selectedPosition: GalaxyPosition,
): GalaxyIdeaNode[] {
  const relations = [
    ...agreeingIdeas.map((idea) => ({ idea, relation: 'agreement' as const })),
    ...disagreeingIdeas.map((idea) => ({ idea, relation: 'disagreement' as const })),
  ]
  const count = Math.max(relations.length, 1)

  return relations.map((item, index) => {
    const angle = -Math.PI * 0.78 + (index / Math.max(count - 1, 1)) * Math.PI * 1.56
    const radius = 2.05 + (index % 2) * 0.3

    return {
      ...item,
      position: {
        x: selectedPosition.x + Math.cos(angle) * radius,
        y: selectedPosition.y + Math.sin(angle) * radius * 0.72,
        z: selectedPosition.z + 0.35 + Math.cos(angle) * 0.18,
      },
    }
  })
}
