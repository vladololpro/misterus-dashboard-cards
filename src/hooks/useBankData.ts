import { useCallback } from 'react'
import { useGetCardsQuery, useGetOperationsQuery } from '@shared/api/bankApiSlice'

export function useBankData() {
  const {
    data: cards = [],
    isLoading: isCardsLoading,
    isFetching: isCardsFetching,
    isError: isCardsError,
    refetch: refetchCards,
  } = useGetCardsQuery()

  const {
    data: operations = [],
    isLoading: isOperationsLoading,
    isFetching: isOperationsFetching,
    isError: isOperationsError,
    refetch: refetchOperations,
  } = useGetOperationsQuery()

  const refresh = useCallback(() => {
    void refetchCards()
    void refetchOperations()
  }, [refetchCards, refetchOperations])

  return {
    cards,
    operations,
    isLoading: isCardsLoading || isOperationsLoading,
    isFetching: isCardsFetching || isOperationsFetching,
    isError: isCardsError || isOperationsError,
    refresh,
  }
}
