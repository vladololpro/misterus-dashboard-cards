import { Card, CardWithStats, Operation } from '../types'
import { USD_TO_RUB } from '../config/constants'
import { getCardById } from './getCardById'
import { getMerchantIcon } from './getMerchantIcon'

export interface CurrencyStat {
  currency: string
  income: number
  expense: number
}

export interface CategoryStat {
  category: string
  total: number
}

export interface OperationsStats {
  currencyStats: CurrencyStat[]
  operationsByCard: CardWithStats[]
  incomeChartData: CategoryStat[]
  expenseChartData: CategoryStat[]
  totalIncome: number
  totalExpense: number
}

const toRub = (amount: number, currency: string): number =>
  currency === '$' ? amount * USD_TO_RUB : amount

const buildCategoryStats = (
  cards: Card[],
  operations: Operation[],
  type: 'income' | 'expense'
): CategoryStat[] => {
  const statsByCategory: Record<string, CategoryStat> = {}

  operations.forEach((operation) => {
    const isExpectedType = type === 'income' ? operation.amount > 0 : operation.amount < 0
    if (!isExpectedType) return

    const card = getCardById(cards, operation.cardId)
    if (!card) return

    const category = getMerchantIcon(operation.title).category
    const amountInRub = toRub(Math.abs(operation.amount), card.currency)

    if (!statsByCategory[category]) {
      statsByCategory[category] = { category, total: 0 }
    }

    const stat = statsByCategory[category]
    if (stat) stat.total += amountInRub
  })

  return Object.values(statsByCategory).filter((category) => category.total > 0)
}

const getCategoryTotal = (categories: CategoryStat[]): number =>
  categories.reduce((sum, category) => sum + category.total, 0)

export function buildOperationsStats(cards: Card[], operations: Operation[]): OperationsStats {
  const statsByCurrency: Record<string, CurrencyStat> = {}

  cards.forEach((card) => {
    if (!statsByCurrency[card.currency]) {
      statsByCurrency[card.currency] = { currency: card.currency, income: 0, expense: 0 }
    }
  })

  operations.forEach((operation) => {
    const card = getCardById(cards, operation.cardId)
    if (!card) return

    if (!statsByCurrency[card.currency]) {
      statsByCurrency[card.currency] = { currency: card.currency, income: 0, expense: 0 }
    }

    const stat = statsByCurrency[card.currency]
    if (!stat) return

    if (operation.amount > 0) {
      stat.income += operation.amount
    } else {
      stat.expense += Math.abs(operation.amount)
    }
  })

  const operationsByCard: CardWithStats[] = cards
    .map((card) => {
      const cardOperations = operations.filter((operation) => operation.cardId === card.id)

      return {
        ...card,
        opsCount: cardOperations.length,
        total: cardOperations.reduce((sum, operation) => sum + operation.amount, 0),
      }
    })
    .filter((card) => card.opsCount > 0)

  const incomeChartData = buildCategoryStats(cards, operations, 'income')
  const expenseChartData = buildCategoryStats(cards, operations, 'expense')

  return {
    currencyStats: Object.values(statsByCurrency),
    operationsByCard,
    incomeChartData,
    expenseChartData,
    totalIncome: getCategoryTotal(incomeChartData),
    totalExpense: getCategoryTotal(expenseChartData),
  }
}
