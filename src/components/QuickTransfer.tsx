import { useEffect, useMemo, useState, ChangeEvent, FormEvent } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useCreateTransferMutation } from '../shared/api/bankApiSlice'
import { getApiErrorMessage } from '../shared/api/errors'
import { formatCardNumber } from '../shared/lib/formatCard'
import { formatMoney } from '../shared/lib/formatMoney'
import { Card, NewOperation } from '../shared/types'
import NoticeBanner from './NoticeBanner'

interface QuickTransferProps {
  cards: Card[]
  activeCardId: number | null
}

type TransferState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

function QuickTransfer({ cards, activeCardId }: QuickTransferProps) {
  const [amount, setAmount] = useLocalStorage<string>('last_transfer_amount', '')
  const [targetCardId, setTargetCardId] = useLocalStorage<number | null>('last_transfer_target', null)
  const [transferState, setTransferState] = useState<TransferState>({ status: 'idle' })
  const [createTransfer] = useCreateTransferMutation()

  const activeCard = cards.find((card) => card.id === activeCardId)

  const availableTargets = useMemo(
    () =>
      cards.filter(
        (card) =>
          card.id !== activeCardId &&
          card.currency === activeCard?.currency &&
          !card.isBlocked
      ),
    [cards, activeCardId, activeCard?.currency]
  )

  const targetCard = availableTargets.find((card) => card.id === targetCardId)

  useEffect(() => {
    if (!activeCard) return

    if (availableTargets.length === 0) {
      if (targetCardId !== null) setTargetCardId(null)
      return
    }

    if (!availableTargets.some((card) => card.id === targetCardId)) {
      const firstAvailableTarget = availableTargets[0]
      setTargetCardId(firstAvailableTarget?.id ?? null)
    }
  }, [activeCard, availableTargets, targetCardId, setTargetCardId])

  useEffect(() => {
    if (transferState.status !== 'success') return

    const timer = window.setTimeout(() => {
      setTransferState({ status: 'idle' })
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [transferState])

  const resetStatus = () => {
    if (transferState.status !== 'submitting') {
      setTransferState({ status: 'idle' })
    }
  }

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
    resetStatus()
  }

  const handleTargetChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setTargetCardId(value ? Number(value) : null)
    resetStatus()
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!activeCard) {
      setTransferState({ status: 'error', message: 'Сначала выберите карту-источник' })
      return
    }

    if (activeCard.isBlocked) {
      setTransferState({ status: 'error', message: 'Карта-источник заблокирована' })
      return
    }

    if (!targetCard) {
      setTransferState({ status: 'error', message: 'Выберите карту для перевода' })
      return
    }

    const normalizedAmount = amount.replace(',', '.').trim()
    const numericAmount = Number(normalizedAmount)

    if (!normalizedAmount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setTransferState({ status: 'error', message: 'Введите корректную сумму больше нуля' })
      return
    }

    const transferAmount = Math.round(numericAmount * 100) / 100

    if (transferAmount <= 0) {
      setTransferState({ status: 'error', message: 'Введите корректную сумму больше нуля' })
      return
    }

    if (transferAmount > activeCard.balance) {
      setTransferState({ status: 'error', message: 'Недостаточно средств на карте' })
      return
    }

    const outgoingOperation: NewOperation = {
      cardId: activeCard.id,
      title: `Перевод на карту ${formatCardNumber(targetCard.number)}`,
      amount: -transferAmount,
      date: new Date().toISOString().slice(0, 10),
    }

    setTransferState({ status: 'submitting' })

    try {
      await createTransfer({
        fromCardId: activeCard.id,
        toCardId: targetCard.id,
        amount: transferAmount,
      }).unwrap()

      setAmount('')
      setTransferState({
        status: 'success',
        message: `${outgoingOperation.title} на сумму ${formatMoney(Math.abs(outgoingOperation.amount), activeCard.currency)} выполнен`,
      })
    } catch (error: unknown) {
      setTransferState({
        status: 'error',
        message: getApiErrorMessage(error, 'Не удалось выполнить перевод'),
      })
    }
  }

  if (!activeCard) return null

  const isSubmitting = transferState.status === 'submitting'
  const canTransfer = availableTargets.length > 0 && !activeCard.isBlocked

  return (
    <form className="quick-transfer" onSubmit={handleSubmit}>
      <div className="quick-transfer__header">
        <div>
          <h3 className="quick-transfer__title">Быстрый перевод</h3>
          <p className="quick-transfer__subtitle">Между своими картами в одной валюте</p>
        </div>
        <div className="quick-transfer__balance">
          <span className="quick-transfer__balance-label">Доступно</span>
          <strong className="quick-transfer__balance-value">
            {formatMoney(activeCard.balance, activeCard.currency)}
          </strong>
        </div>
      </div>

      <div className="quick-transfer__source">
        <span className="quick-transfer__source-label">С карты</span>
        <span className="quick-transfer__source-number">{formatCardNumber(activeCard.number)}</span>
      </div>

      <div className="quick-transfer__grid">
        <label className="quick-transfer__field">
          <span className="quick-transfer__label">Карта получателя</span>
          {availableTargets.length === 0 ? (
            <span className="quick-transfer__empty">Нет доступных карт в той же валюте</span>
          ) : (
            <>
              <div className="quick-transfer__select-wrap">
                <select
                  className="quick-transfer__select"
                  value={targetCardId ?? ''}
                  onChange={handleTargetChange}
                  disabled={isSubmitting}
                >
                  <option value="" disabled>Выберите карту</option>
                  {availableTargets.map((card) => (
                    <option key={card.id} value={card.id}>
                      {formatCardNumber(card.number)} — {formatMoney(card.balance, card.currency)}
                    </option>
                  ))}
                </select>
              </div>
              {targetCard && (
                <span className="quick-transfer__hint">
                  Баланс получателя: {formatMoney(targetCard.balance, targetCard.currency)}
                </span>
              )}
            </>
          )}
        </label>

        <label className="quick-transfer__field">
          <span className="quick-transfer__label">Сумма перевода</span>
          <input
            className="quick-transfer__input"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder={`Например, 1500 ${activeCard.currency}`}
            disabled={isSubmitting || !canTransfer}
          />
          <span className="quick-transfer__hint">Можно указать копейки: 1500,50</span>
        </label>
      </div>

      {activeCard.isBlocked && (
        <NoticeBanner message="Карта-источник заблокирована. Разблокируйте её, чтобы выполнить перевод." />
      )}

      {transferState.status === 'error' && (
        <NoticeBanner
          message={transferState.message}
          onClose={() => setTransferState({ status: 'idle' })}
        />
      )}

      {transferState.status === 'success' && (
        <NoticeBanner
          variant="success"
          message={transferState.message}
          onClose={() => setTransferState({ status: 'idle' })}
        />
      )}

      <div className="quick-transfer__actions">
        <button
          type="submit"
          className="quick-transfer__submit"
          disabled={isSubmitting || !canTransfer}
        >
          {isSubmitting ? 'Переводим...' : 'Перевести'}
        </button>
      </div>
    </form>
  )
}

export default QuickTransfer
