import { Operation } from '../types'

const getOperationTimestamp = (operation: Operation): number => {
  const value = operation.createdAt ?? operation.date
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export function sortOperationsByNewest(operations: Operation[]): Operation[] {
  return [...operations].sort((a, b) => {
    const byTimestamp = getOperationTimestamp(b) - getOperationTimestamp(a)
    return byTimestamp !== 0 ? byTimestamp : b.id - a.id
  })
}
