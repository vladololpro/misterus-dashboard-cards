import { useState } from 'react'
import { useSelector } from 'react-redux'
import CardList from '@components/CardList'
import BalanceWidget from '@components/BalanceWidget'
import OperationsList from '@components/OperationsList'
import FilterBar from '@components/FilterBar'
import NoticeBanner from '@components/NoticeBanner'
import CardDetails from '@components/CardDetails'
import QuickTransfer from '@components/QuickTransfer'
import { useActiveCard } from '../hooks/useActiveCard'
import { useBankData } from '../hooks/useBankData'
import { useToggleCardBlockMutation } from '@shared/api/bankApiSlice'
import { RootState } from '../app/store'
import { Card, LoadingState } from '../shared/types'

function DashboardPage() {
  const [blockError, setBlockError] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const filter = useSelector((state: RootState) => state.filter.value)

  const { cards, operations, isLoading, isError, refresh } = useBankData()
  const [toggleCardBlock] = useToggleCardBlockMutation()

  const { activeCardId, setActiveCardId, activeCard, activeOperations } =
    useActiveCard(cards, operations, filter)

  async function handleToggleBlock(cardId: number) {
    setBlockError(null)
    try {
      await toggleCardBlock(cardId).unwrap()
    } catch (err) {
      console.error('Ошибка блокировки:', err)
      setBlockError('Не удалось изменить статус карты')
    }
  }

  const hasData = cards.length > 0

  const loadingState: LoadingState = isLoading
    ? { status: 'loading' }
    : isError
      ? { status: 'error', message: 'Не удалось загрузить данные. Проверьте соединение.' }
      : hasData
        ? { status: 'success' }
        : { status: 'idle' }

  if (loadingState.status === 'loading' && !hasData) {
    return (
      <div className="load-indicator" style={{ marginTop: '40px' }}>
        <span className="load-spinner"></span>
        <span>Идёт загрузка...</span>
      </div>
    )
  }

  if (loadingState.status === 'idle') {
    return <p className="load-empty">Карт пока нет. Нажмите «Обновить данные».</p>
  }

  return (
    <>
      {loadingState.status === 'error' && (
        <NoticeBanner
          className="notice-banner--page"
          message={loadingState.message}
          actionLabel="Повторить"
          onAction={refresh}
        />
      )}

      {blockError && (
        <NoticeBanner
          className="notice-banner--page"
          variant="warning"
          message={blockError}
          actionLabel="Понятно"
          onAction={() => setBlockError(null)}
        />
      )}

      {hasData && (
        <div>
          <div className="page-header">
            <h2>Мои карты</h2>
          </div>

          <CardList
            cards={cards}
            activeCardId={activeCardId}
            onSelectCard={setActiveCardId}
            onToggleBlock={handleToggleBlock}
            onShowDetails={setSelectedCard}
          />
          
          <BalanceWidget card={activeCard} />
          
          <FilterBar />
          
          <QuickTransfer cards={cards} activeCardId={activeCardId} />

          <OperationsList
            operations={activeOperations}
            currency={activeCard?.currency}
            cardNumber={activeCard?.number}
            filter={filter}
          />
        </div>
      )}

      {selectedCard && (
        <CardDetails 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </>
  )
}

export default DashboardPage