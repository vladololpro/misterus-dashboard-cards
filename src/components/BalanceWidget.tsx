import { CardBalanceInfo } from '../shared/types'
import { formatMoney } from '@shared/lib/formatMoney'

interface BalanceWidgetProps {
  card: CardBalanceInfo | undefined
}

function BalanceWidget({ card }: BalanceWidgetProps) {
  if (!card) return null

  return (
    <div className="balance-widget">
      <div className="balance-widget__info">
        <span className="balance-widget__label">Баланс</span>
        <span className="balance-widget__value">{formatMoney(card.balance, card.currency)}</span>
      </div>
      
      {card.isBlocked && (
        <div className="balance-widget__warning">
          ⚠️ Карта заблокирована
        </div>
      )}
    </div>
  )
}

export default BalanceWidget