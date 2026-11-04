import CardItem from '@components/CardItem'
import { Card } from '../shared/types'

interface CardListProps {
  cards: Card[]
  activeCardId: number | null
  onSelectCard: (id: number) => void
  onToggleBlock: (id: number) => Promise<void>
  onShowDetails: (card: Card) => void
}

function CardList({ cards, activeCardId, onSelectCard, onToggleBlock, onShowDetails }: CardListProps) {
  return (
    <div className="card-list">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          isActive={card.id === activeCardId}
          onSelect={onSelectCard}
          onToggleBlock={onToggleBlock}
          onShowDetails={onShowDetails}
        />
      ))}
    </div>
  )
}

export default CardList