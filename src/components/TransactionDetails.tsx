import { formatMoney } from '@shared/lib/formatMoney'
import { formatCardNumber } from '@shared/lib/formatCard'
import { getMerchantIcon } from '@shared/lib/getMerchantIcon'
import { Card, Operation } from '../shared/types'
import Modal from './Modal'

interface TransactionDetailsProps {
  operation: Operation
  card: Card | undefined
  onClose: () => void
}

const formatOperationDate = (operation: Operation): string => {
  if (!operation.createdAt) return operation.date

  const createdAt = new Date(operation.createdAt)
  if (Number.isNaN(createdAt.getTime())) return operation.date

  return createdAt.toLocaleString('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function TransactionDetails({ operation, card, onClose }: TransactionDetailsProps) {
  const isIncome = operation.amount > 0
  const merchant = getMerchantIcon(operation.title)
  const currency = card?.currency ?? '₽'

  return (
    <Modal title="Детали операции" onClose={onClose}>
      <div className="modal-icon-wrap">
        <div
          className="history-item__icon history-item__icon--large"
          style={{ backgroundColor: merchant.color }}
        >
          {merchant.icon}
        </div>
        <h4 className="modal-op-title">{operation.title}</h4>
        <span className="modal-op-amount" style={{ color: isIncome ? '#2E7D32' : '#c0392b' }}>
          {formatMoney(operation.amount, currency, { withSign: true })}
        </span>
      </div>

      <div className="modal-details-list">
        <div className="modal-detail-row">
          <span className="modal-detail-label">Дата и время</span>
          <span className="modal-detail-value">{formatOperationDate(operation)}</span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">Карта</span>
          <span className="modal-detail-value">
            {card ? formatCardNumber(card.number) : 'Карта не найдена'}
          </span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">Тип операции</span>
          <span className="modal-detail-value">{isIncome ? 'Пополнение' : 'Списание'}</span>
        </div>
        <div className="modal-detail-row">
          <span className="modal-detail-label">Категория</span>
          <span className="modal-detail-value">{merchant.category}</span>
        </div>
      </div>
    </Modal>
  )
}

export default TransactionDetails
