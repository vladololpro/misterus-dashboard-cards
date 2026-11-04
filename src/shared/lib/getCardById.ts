import { Card } from '../types'

export function getCardById(cards: Card[], cardId: number): Card | undefined {
  return cards.find((card) => card.id === cardId)
}
