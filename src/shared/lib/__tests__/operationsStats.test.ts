import type { Card, Operation } from '@shared/types'
import { buildOperationsStats } from '../operationsStats'

const makeCard = (id: number, currency = '₽'): Card => ({
  id,
  number: `card-${id}`,
  balance: 1000,
  currency,
  isBlocked: false,
  expiry: '12/29',
  type: 'Mir',
})

const makeOperation = (id: number, cardId: number, amount: number, title: string): Operation => ({
  id,
  cardId,
  title,
  amount,
  date: '2026-10-01',
})

describe('buildOperationsStats', () => {
  const cards = [makeCard(1), makeCard(2), makeCard(3, '$')]
  const operations = [
    makeOperation(1, 1, 1000, 'Зарплата за октябрь'),
    makeOperation(2, 1, -200, 'Покупка в Пятёрочка'),
    makeOperation(3, 2, -100, 'Кофейня у дома'),
    makeOperation(4, 3, -10, 'Покупка в Steam'),
    makeOperation(5, 999, -50, 'Аптека'),
  ]

  test('aggregates income and expense by currency', () => {
    expect(buildOperationsStats(cards, operations).currencyStats).toEqual([
      { currency: '₽', income: 1000, expense: 300 },
      { currency: '$', income: 0, expense: 10 },
    ])
  })

  test('groups operations by card and skips cards without operations', () => {
    expect(buildOperationsStats(cards, operations).operationsByCard).toEqual([
      { ...makeCard(1), opsCount: 2, total: 800 },
      { ...makeCard(2), opsCount: 1, total: -100 },
      { ...makeCard(3, '$'), opsCount: 1, total: -10 },
    ])
  })

  test('builds income chart data by category', () => {
    expect(buildOperationsStats(cards, operations).incomeChartData).toEqual([
      { category: 'Доход', total: 1000 },
    ])
  })

  test('builds expense chart data and converts USD to rubles', () => {
    expect(buildOperationsStats(cards, operations).expenseChartData).toEqual([
      { category: 'Продукты', total: 200 },
      { category: 'Кафе и рестораны', total: 100 },
      { category: 'Развлечения', total: 900 },
    ])
  })

  test('counts chart totals only for known cards', () => {
    const stats = buildOperationsStats(cards, operations)

    expect(stats.totalIncome).toBe(1000)
    expect(stats.totalExpense).toBe(1200)
  })

  test('returns empty stats for empty input', () => {
    expect(buildOperationsStats([], [])).toEqual({
      currencyStats: [],
      operationsByCard: [],
      incomeChartData: [],
      expenseChartData: [],
      totalIncome: 0,
      totalExpense: 0,
    })
  })

  test('ignores operations with an unknown card', () => {
    const stats = buildOperationsStats([makeCard(1)], [makeOperation(9, 777, -50, 'Аптека')])

    expect(stats.currencyStats).toEqual([{ currency: '₽', income: 0, expense: 0 }])
    expect(stats.operationsByCard).toEqual([])
    expect(stats.expenseChartData).toEqual([])
    expect(stats.totalExpense).toBe(0)
  })

  test('keeps currency stats in original currency while charts use rubles', () => {
    const stats = buildOperationsStats(
      [makeCard(1, '$')],
      [makeOperation(1, 1, -25, 'Покупка в Steam')]
    )

    expect(stats.currencyStats).toEqual([{ currency: '$', income: 0, expense: 25 }])
    expect(stats.expenseChartData).toEqual([{ category: 'Развлечения', total: 2250 }])
  })
})
