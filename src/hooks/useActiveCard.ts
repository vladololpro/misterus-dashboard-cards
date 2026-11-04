import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setActiveCardId } from '../features/cards/cardsSlice'
import { Card, Operation, FilterValue } from '../shared/types'
import { sortOperationsByNewest } from '../shared/lib/sortOperations'
import { RootState } from '../app/store'

export function useActiveCard(
  cards: Card[],
  operations: Operation[],
  filter: FilterValue
) {
  const dispatch = useDispatch()
  
  const activeCardId = useSelector((state: RootState) => state.cards.activeCardId)

  useEffect(() => {
    const exists = cards.some((card) => card.id === activeCardId)
    const firstCardId = cards[0]?.id

    if (!exists && firstCardId !== undefined) {
      dispatch(setActiveCardId(firstCardId))
    }
  }, [cards, activeCardId, dispatch])

  const activeCard = cards.find((card) => card.id === activeCardId)

  const activeOperations = useMemo(() => {
    const filtered = operations
      .filter((op) => op.cardId === activeCardId)
      .filter((op) => {
        if (filter === 'income') return op.amount > 0
        if (filter === 'expense') return op.amount < 0
        return true
      })

    return sortOperationsByNewest(filtered)
  }, [operations, activeCardId, filter])

  const handleSetActiveCardId = (id: number) => dispatch(setActiveCardId(id))

  return { 
    activeCardId, 
    setActiveCardId: handleSetActiveCardId, 
    activeCard, 
    activeOperations 
  }
}