import type { Operation } from '@shared/types'
import { sortOperationsByNewest } from '../sortOperations'

const makeOperation = (id: number, overrides: Partial<Operation> = {}): Operation => ({
  id,
  cardId: 1,
  title: `operation-${id}`,
  amount: -id,
  date: '2026-01-01',
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
})

describe('sortOperationsByNewest', () => {
  test('sorts by createdAt descending', () => {
    const operations = [
      makeOperation(1, { createdAt: '2026-01-01T00:00:00Z' }),
      makeOperation(2, { createdAt: '2026-01-03T00:00:00Z' }),
      makeOperation(3, { createdAt: '2026-01-02T00:00:00Z' }),
    ]

    expect(sortOperationsByNewest(operations).map((operation) => operation.id)).toEqual([2, 3, 1])
  })

  test('falls back to date when createdAt is missing', () => {
    const operations = [
      makeOperation(1, { date: '2026-02-01', createdAt: undefined }),
      makeOperation(2, { date: '2026-03-01', createdAt: undefined }),
      makeOperation(3, { date: '2026-01-01', createdAt: undefined }),
    ]

    expect(sortOperationsByNewest(operations).map((operation) => operation.id)).toEqual([2, 1, 3])
  })

  test('prefers createdAt over date', () => {
    const operations = [
      makeOperation(1, { date: '2026-01-10', createdAt: '2026-01-01T00:00:00Z' }),
      makeOperation(2, { date: '2026-01-01', createdAt: '2026-01-09T00:00:00Z' }),
    ]

    expect(sortOperationsByNewest(operations).map((operation) => operation.id)).toEqual([2, 1])
  })

  test('breaks equal timestamps by id descending', () => {
    const timestamp = '2026-05-01T12:00:00Z'
    const operations = [
      makeOperation(2, { createdAt: timestamp }),
      makeOperation(9, { createdAt: timestamp }),
      makeOperation(5, { createdAt: timestamp }),
    ]

    expect(sortOperationsByNewest(operations).map((operation) => operation.id)).toEqual([9, 5, 2])
  })

  test('treats an invalid date as the earliest timestamp', () => {
    const operations = [
      makeOperation(1, { createdAt: 'not-a-date' }),
      makeOperation(2, { createdAt: '2026-01-01T00:00:00Z' }),
    ]

    expect(sortOperationsByNewest(operations).map((operation) => operation.id)).toEqual([2, 1])
  })

  test('does not mutate the source array', () => {
    const operations = [makeOperation(1), makeOperation(2)]
    const originalIds = operations.map((operation) => operation.id)

    const result = sortOperationsByNewest(operations)

    expect(result).not.toBe(operations)
    expect(operations.map((operation) => operation.id)).toEqual(originalIds)
  })
})
