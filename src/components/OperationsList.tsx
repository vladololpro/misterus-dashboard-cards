import { formatMoney } from '@shared/lib/formatMoney'
import { formatCardNumber } from '@shared/lib/formatCard'
import { Operation, FilterValue } from '../shared/types'

interface OperationsListProps {
  operations: Operation[]
  currency?: string
  cardNumber?: string
  filter?: FilterValue
}

function OperationsList({ operations, currency = '₽', cardNumber, filter = 'all' }: OperationsListProps) {
  if (operations.length === 0) {
    const message =
      filter === 'all'
        ? 'Операций пока нет'
        : filter === 'income'
          ? 'Доходов по этой карте нет'
          : 'Расходов по этой карте нет'
    return <p className="operations-list__empty">{message}</p>
  }

  return (
    <div>
      {cardNumber && (
        <h2>Операции по карте {formatCardNumber(cardNumber)}</h2>
      )}
      <ul className="operations-list dashboard-operations">
        {operations.map((op) => (
          <li key={op.id}>
            <span>{op.title}</span>
            <span>{formatMoney(op.amount, currency, { withSign: true })}</span>
            <span>{op.date}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OperationsList