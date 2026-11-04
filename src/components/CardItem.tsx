import { useState, KeyboardEvent, MouseEvent } from 'react'
import { formatMoney } from '@shared/lib/formatMoney'
import { formatCardNumber } from '@shared/lib/formatCard'
import Button from '@shared/ui/Button'
import { Card } from '../shared/types'

interface CardItemProps {
  card: Card
  isActive: boolean
  onSelect: (id: number) => void
  onToggleBlock: (id: number) => Promise<void>
  onShowDetails: (card: Card) => void
}

function CardItem({ card, isActive, onSelect, onToggleBlock, onShowDetails }: CardItemProps) {
  const [isToggling, setIsToggling] = useState<boolean>(false)

  const handleBlockClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (isToggling) return
    setIsToggling(true)
    try {
      await onToggleBlock(card.id)
    } finally {
      setIsToggling(false)
    }
  }

  const handleDetailsClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onShowDetails(card)
  }

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(card.id)
    }
  }

  let colorClass = ''
  if (card.type === 'Mir') colorClass = 'card-item--mir'
  else if (card.type === 'Visa') colorClass = 'card-item--visa'
  else if (card.type === 'MasterCard') colorClass = 'card-item--mastercard'

  return (
    <div
      className={[
        'card-item',
        isActive && 'card-item--active',
        card.isBlocked && 'card-item--blocked',
        colorClass
      ].filter(Boolean).join(' ')}
      onClick={() => onSelect(card.id)}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
    >
      <div className="card-item__top">
        <span className="card-item__number">{formatCardNumber(card.number)}</span>
        {card.isBlocked && <span className="card-item__status">Заблокирована</span>}
      </div>

      <span className="card-item__balance">{formatMoney(card.balance, card.currency)}</span>

      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <Button
          className="card-item__block-btn"
          onClick={handleBlockClick}
          disabled={isToggling}
          style={{ flex: 1 }}
        >
          {isToggling ? '...' : card.isBlocked ? 'Разблокировать' : 'Заблокировать'}
        </Button>
        
        <Button
          className="card-item__block-btn"
          onClick={handleDetailsClick}
          style={{ flex: 1 }}
        >
          Подробнее
        </Button>
      </div>
    </div>
  )
}

export default CardItem