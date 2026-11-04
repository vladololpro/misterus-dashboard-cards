import { Card, Operation } from '../types'

export const isCardArray = (data: unknown): data is Card[] => {
  if (!Array.isArray(data)) return false
  return data.every(item => 
    typeof item === 'object' && item !== null && 
    'id' in item && typeof item.id === 'number' &&
    'balance' in item && typeof item.balance === 'number' &&
    'number' in item && typeof item.number === 'string' &&
    'currency' in item && typeof item.currency === 'string' &&
    'isBlocked' in item && typeof item.isBlocked === 'boolean' &&
    'expiry' in item && typeof item.expiry === 'string' &&
    'type' in item && typeof item.type === 'string' && ['Mir', 'Visa', 'MasterCard'].includes(item.type)
  )
}

export const isOperationArray = (data: unknown): data is Operation[] => {
  if (!Array.isArray(data)) return false
  return data.every(item => 
    typeof item === 'object' && item !== null && 
    'id' in item && typeof item.id === 'number' &&
    'amount' in item && typeof item.amount === 'number' &&
    'title' in item && typeof item.title === 'string' &&
    'cardId' in item && typeof item.cardId === 'number' &&
    'date' in item && typeof item.date === 'string' &&
    (!('createdAt' in item) || typeof item.createdAt === 'string')
  )
}
