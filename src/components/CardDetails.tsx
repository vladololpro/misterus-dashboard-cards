import { formatMoney } from '@shared/lib/formatMoney'
import { Card } from '../shared/types'
import Modal from './Modal'

interface CardDetailsProps {
  card: Card | null
  onClose: () => void
}

function CardDetails({ card, onClose }: CardDetailsProps) {
  if (!card) return null

  let colorClass = ''
  if (card.type === 'Mir') colorClass = 'card-visual--mir'
  else if (card.type === 'Visa') colorClass = 'card-visual--visa'
  else if (card.type === 'MasterCard') colorClass = 'card-visual--mastercard'

  return (
    <Modal title="Информация о карте" onClose={onClose}>
      <div className={`card-visual ${colorClass}`}>
        <div className="card-visual__top">
          <span className="card-visual__type">{card.type}</span>
          {card.isBlocked && <span className="card-visual__blocked">Заблокирована</span>}
        </div>
        <div className="card-visual__number">{card.number}</div>
        <div className="card-visual__bottom">
          <div>
            <span className="card-visual__label">Срок действия</span>
            <span className="card-visual__value">{card.expiry}</span>
          </div>
          <div>
            <span className="card-visual__label">Баланс</span>
            <span className="card-visual__value">{formatMoney(card.balance, card.currency)}</span>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CardDetails
