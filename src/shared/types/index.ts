export interface Card {
  id: number
  number: string
  balance: number
  currency: string
  isBlocked: boolean
  expiry: string
  type: 'Mir' | 'Visa' | 'MasterCard'
}

export interface Operation {
  id: number
  cardId: number
  title: string
  amount: number
  date: string
  createdAt?: string
}

export type FilterValue = 'all' | 'income' | 'expense'

export type CardBalanceInfo = Pick<Card, 'balance' | 'currency' | 'isBlocked'>

export type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export type CardWithStats = Card & { opsCount: number; total: number }

export type NewOperation = Omit<Operation, 'id'>

export interface TransferPayload {
  fromCardId: number
  toCardId: number
  amount: number
}

export interface TransferResult {
  fromCard: Card
  toCard: Card
  operations: Operation[]
}