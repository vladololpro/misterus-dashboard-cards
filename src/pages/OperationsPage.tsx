import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FILTERS, setFilter } from '../features/filter/filterSlice'
import { formatMoney } from '@shared/lib/formatMoney'
import { formatCardNumber } from '@shared/lib/formatCard'
import { getMerchantIcon } from '@shared/lib/getMerchantIcon'
import { sortOperationsByNewest } from '@shared/lib/sortOperations'
import { buildOperationsStats } from '@shared/lib/operationsStats'
import { getCardById } from '@shared/lib/getCardById'
import NoticeBanner from '@components/NoticeBanner'
import CategoryPieChart from '@components/CategoryPieChart'
import TransactionDetails from '@components/TransactionDetails'
import { useBankData } from '../hooks/useBankData'
import { RootState } from '../app/store'
import { Operation } from '../shared/types'

function OperationsPage() {
  const dispatch = useDispatch()
  const currentFilter = useSelector((state: RootState) => state.filter.value)
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null)
  const { cards, operations, isLoading, isError, refresh } = useBankData()

  const hasData = cards.length > 0 || operations.length > 0

  const {
    currencyStats,
    operationsByCard,
    incomeChartData,
    expenseChartData,
    totalIncome,
    totalExpense,
  } = useMemo(() => buildOperationsStats(cards, operations), [cards, operations])

  const getCardInfo = (cardId: number) => getCardById(cards, cardId)

  const filteredOperations = sortOperationsByNewest(
    operations.filter((operation) => {
      if (currentFilter === 'income') return operation.amount > 0
      if (currentFilter === 'expense') return operation.amount < 0
      return true
    })
  )

  if (isLoading && !hasData) {
    return (
      <div className="load-indicator" style={{ marginTop: '40px' }}>
        <span className="load-spinner"></span> 
        <span>Загрузка истории...</span>
      </div>
    )
  }

  return (
    <div>
      {isError && (
        <NoticeBanner
          className="notice-banner--page"
          message="Не удалось загрузить данные. Проверьте соединение."
          actionLabel="Повторить"
          onAction={refresh}
        />
      )}

      <div className="page-header">
        <h2>Финансовая история</h2>
      </div>

      {!isError && !hasData && (
        <p className="load-empty">Операций пока нет.</p>
      )}

      {hasData && (
        <>
          <h3 className="section-title">Активность по картам</h3>
          <div className="card-stats-grid">
            {operationsByCard.map(card => (
              <div key={card.id} className="mini-card">
                <div className="mini-card__header">
                  <span>{formatCardNumber(card.number)}</span>
                  <span className="mini-card__badge">{card.opsCount} оп.</span>
                </div>
                <span className={`mini-card__total ${card.total >= 0 ? 'text-green' : 'text-red'}`}>
                  {card.total > 0 ? '+' : ''}{formatMoney(card.total, card.currency)}
                </span>
              </div>
            ))}
          </div>

          <h3 className="section-title">Общая статистика</h3>
          <div className="history-stats-grid">
            {currencyStats.map(stat => {
              const currencyName = stat.currency === '₽' ? 'Рубли' : stat.currency === '$' ? 'Доллары' : 'Валюта'
              
              return (
                <div key={stat.currency} className="currency-stat-block">
                  <div className="currency-stat-header">
                    <span className="currency-name">{currencyName}</span>
                  </div>
                  <div className="currency-stat-rows">
                    <div className="currency-row">
                      <span>Доходы:</span>
                      <span className="text-green">+{formatMoney(stat.income, stat.currency)}</span>
                    </div>
                    <div className="currency-row">
                      <span>Расходы:</span>
                      <span className="text-red">-{formatMoney(stat.expense, stat.currency)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <h3 className="section-title">Диаграмма зачислений</h3>
          <CategoryPieChart
            data={incomeChartData}
            total={totalIncome}
            emptyMessage="Нет данных о зачислениях."
          />

          <h3 className="section-title">Диаграмма расходов</h3>
          <CategoryPieChart
            data={expenseChartData}
            total={totalExpense}
            emptyMessage="Нет данных о расходах."
          />

          <div className="transactions-header">
            <h3 className="section-title">Все транзакции</h3>
            <div className="filter-bar filter-bar--compact">
              {FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  className={currentFilter === value ? 'filter-btn filter-btn--active' : 'filter-btn'}
                  onClick={() => dispatch(setFilter(value))}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredOperations.length === 0 ? (
            <p className="load-empty">Операций с таким фильтром нет.</p>
          ) : (
            <ul className="operations-list history-list">
              {filteredOperations.map(op => {
                const card = getCardInfo(op.cardId)
                const merchant = getMerchantIcon(op.title)
                const isIncome = op.amount > 0

                return (
                  <li 
                    key={op.id} 
                    className="history-item"
                    onClick={() => setSelectedOp(op)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="history-item__left">
                      <div 
                        className="history-item__icon" 
                        style={{ backgroundColor: merchant.color }}
                      >
                        {merchant.icon}
                      </div>
                      <div className="history-item__info">
                        <span className="history-item__title">{op.title}</span>
                        <span className="history-item__card">
                          {card ? `Карта ${formatCardNumber(card.number)}` : 'Карта не найдена'}
                        </span>
                      </div>
                    </div>
                    <div className="history-item__right">
                      <div className="history-item__amount" style={{ color: isIncome ? '#2E7D32' : '#c0392b' }}>
                        {formatMoney(op.amount, card?.currency ?? '₽', { withSign: true })}
                      </div>
                      <div className="history-item__date">{op.date}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      {selectedOp && (
        <TransactionDetails 
          operation={selectedOp}
          card={getCardInfo(selectedOp.cardId)}
          onClose={() => setSelectedOp(null)}
        />
      )}
    </div>
  )
}

export default OperationsPage
